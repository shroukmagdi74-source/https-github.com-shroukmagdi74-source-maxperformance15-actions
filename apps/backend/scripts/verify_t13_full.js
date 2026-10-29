/**
 * @file verify_t13_full.js
 * @description سكريبت التحقق الشامل لتاسك T13 على قاعدة بيانات maxp_qa المحلية
 */

const crypto = require('crypto');
const path = require('path');
const { getSharedPrismaClient } = require('../services/sharedDatabase');
const metaAppRegistry = require('../services/metaAppRegistryService');
const {
  getFacebookAppKeyConfig,
  getFacebookWebhookVerifyTokens,
  DEFAULT_FACEBOOK_APP_ID
} = require('../config/facebookAppConfig');
const { verifyMetaWebhookSignatureAgainstApps } = require('../utils/webhookSignature');
const { resolveFacebookAppKeyForPage, featureRequiresGrowth } = require('../services/facebookAppResolver');

async function run() {
  console.log('================================================================');
  console.log('🚀 [T13 VERIFICATION] بدء التحقق الشامل من بنية تطبيقي Meta');
  console.log('================================================================\n');

  // Set mock environment secrets
  process.env.FACEBOOK_APP_SECRET = 'mock_primary_secret_value_32chars';
  process.env.FACEBOOK_GROWTH_APP_ID = '998877665544332';
  process.env.FACEBOOK_GROWTH_APP_SECRET = 'mock_growth_secret_value_32chars';
  process.env.FACEBOOK_VERIFY_TOKEN = 'token_primary_qa_verify';
  process.env.FACEBOOK_GROWTH_WEBHOOK_VERIFY_TOKEN = 'token_growth_qa_verify';

  const prisma = getSharedPrismaClient();

  // 1️⃣ اختبار تسجيل التطبيقين في facebook_apps
  console.log('--- [1/8] تسجيل التطبيقين في جدول facebook_apps ---');
  await metaAppRegistry.upsertApp({
    key: 'primary',
    appId: DEFAULT_FACEBOOK_APP_ID,
    appSecretRef: 'FACEBOOK_APP_SECRET',
    configId: '2158986791329815',
    webhookVerifyTokenRef: 'FACEBOOK_WEBHOOK_VERIFY_TOKEN',
    isActive: true
  });

  await metaAppRegistry.upsertApp({
    key: 'growth',
    appId: '998877665544332',
    appSecretRef: 'FACEBOOK_GROWTH_APP_SECRET',
    configId: 'growth_config_123',
    webhookVerifyTokenRef: 'FACEBOOK_GROWTH_WEBHOOK_VERIFY_TOKEN',
    isActive: true
  });

  const dbApps = await prisma.facebookApp.findMany({ orderBy: { key: 'asc' } });
  console.log(`✅ تم استرجاع ${dbApps.length} تطبيقات من جدول facebook_apps:`);
  for (const a of dbApps) {
    console.log(`   - key: ${a.key} | appId: ${a.appId} | appSecretRef: ${a.appSecretRef} | active: ${a.isActive}`);
  }

  // 2️⃣ التأكد من حماية الأسرار (Zero raw secret leak)
  console.log('\n--- [2/8] فحص حماية الأسرار في شاشة الأدمن ---');
  const safeList = await metaAppRegistry.getSafeAppsList();
  const hasRawSecret = safeList.some(a => a.appSecret || a.appSecret === process.env.FACEBOOK_APP_SECRET);
  if (hasRawSecret) {
    throw new Error('❌ خطأ أمني: تم تسريب السر كنص خام في قائمة الأدمن!');
  }
  console.log('✅ تم التحقق: صفر سر مسرب كنص خام في safeAppsList.');

  // 3️⃣ ربط صفحة تجريبية بـ app=growth والتحقق من العمود المخزن
  console.log('\n--- [3/8] اختبار ربط صفحة بـ app=growth ---');
  const testGrowthPageId = 'test_growth_page_101';
  const savedGrowthPage = await prisma.facebookPage.upsert({
    where: { pageId: testGrowthPageId },
    create: {
      id: crypto.randomUUID(),
      pageId: testGrowthPageId,
      pageName: 'صفحة نمو تجريبية',
      pageAccessToken: 'mock_token_growth',
      status: 'connected',
      facebookAppKey: 'growth'
    },
    update: {
      facebookAppKey: 'growth'
    }
  });

  const resolvedGrowthKey = await resolveFacebookAppKeyForPage(testGrowthPageId);
  console.log(`✅ الصفحة ${testGrowthPageId} مخزنة في الداتابيز بـ facebookAppKey = "${resolvedGrowthKey}"`);
  if (resolvedGrowthKey !== 'growth') {
    throw new Error(`❌ المفتاح المتوقع growth ولكن وجد ${resolvedGrowthKey}`);
  }

  // 4️⃣ اختبار استدعاءات Webhook GET بمفتاحي التحقق
  console.log('\n--- [4/8] فحص التحقق من رموز Webhook GET (Dual Verify Tokens) ---');
  const verifyTokens = getFacebookWebhookVerifyTokens();
  const primaryVerifyOk = verifyTokens.has('token_primary_qa_verify');
  const growthVerifyOk = verifyTokens.has('token_growth_qa_verify');
  console.log(`   - رمز Primary: ${primaryVerifyOk ? '✅ مقبول' : '❌ مرفوض'}`);
  console.log(`   - رمز Growth: ${growthVerifyOk ? '✅ مقبول' : '❌ مرفوض'}`);
  if (!primaryVerifyOk || !growthVerifyOk) {
    throw new Error('❌ فشل التحقق من أحد مفتاحي الويب هوك');
  }

  // 5️⃣ اختبار تواقيع Webhook POST بكلا السرين (Dual HMAC Signatures)
  console.log('\n--- [5/8] فحص تواقيع Webhook POST المزدوجة (Dual HMAC) ---');
  const payload = JSON.stringify({
    object: 'page',
    entry: [{ id: testGrowthPageId, messaging: [{ message: { mid: 'mid_qa_test_01', text: 'مرحبا' } }] }]
  });

  // توقيع Primary
  const primarySig = `sha256=${crypto.createHmac('sha256', process.env.FACEBOOK_APP_SECRET).update(payload).digest('hex')}`;
  const reqPrimary = { rawBody: payload, headers: { 'x-hub-signature-256': primarySig } };
  const checkPrimary = verifyMetaWebhookSignatureAgainstApps(reqPrimary);
  console.log(`   - توقيع Primary: ${checkPrimary.ok ? '✅ ناجح' : '❌ فاشل'} (التطبيق: ${checkPrimary.matchedApp})`);

  // توقيع Growth
  const growthSig = `sha256=${crypto.createHmac('sha256', process.env.FACEBOOK_GROWTH_APP_SECRET).update(payload).digest('hex')}`;
  const reqGrowth = { rawBody: payload, headers: { 'x-hub-signature-256': growthSig } };
  const checkGrowth = verifyMetaWebhookSignatureAgainstApps(reqGrowth);
  console.log(`   - توقيع Growth: ${checkGrowth.ok ? '✅ ناجح' : '❌ فاشل'} (التطبيق: ${checkGrowth.matchedApp})`);

  if (!checkPrimary.ok || checkPrimary.matchedApp !== 'primary' || !checkGrowth.ok || checkGrowth.matchedApp !== 'growth') {
    throw new Error('❌ فشل فحص تواقيع الويب هوك المزدوجة');
  }

  // 6️⃣ اختبار منع التكرار في جدول webhook_event_dedupe
  console.log('\n--- [6/8] فحص منع تكرار الأحداث (Dedupe Table & Unique Key) ---');
  const testMid = `mid_dedupe_${Date.now()}`;
  await prisma.webhookEventDedupe.create({
    data: {
      channel: 'facebook',
      externalMessageId: testMid,
      appKey: 'growth'
    }
  });
  console.log(`✅ تم إدراج الحدث ${testMid} في جدول webhook_event_dedupe للمرة الأولى`);

  let duplicateCaught = false;
  try {
    await prisma.webhookEventDedupe.create({
      data: {
        channel: 'facebook',
        externalMessageId: testMid,
        appKey: 'growth'
      }
    });
  } catch (dupErr) {
    if (dupErr.code === 'P2002' || dupErr.message.includes('Unique constraint')) {
      duplicateCaught = true;
      console.log('✅ تم التقاط التكرار بنجاح ومنع معالجة الرسالة مرتين (Unique Constraint Violation)');
    }
  }
  if (!duplicateCaught) {
    throw new Error('❌ فشل نظام منع التكرار في رصد الرسالة المكررة!');
  }

  // 7️⃣ اختبار Feature Gating للميزات التي تتطلب Growth
  console.log('\n--- [7/8] فحص بوابة الميزات (Feature Gating) ---');
  const gateOnPrimary = featureRequiresGrowth('growth_ad_management', 'primary');
  console.log(`   - محاولة ميزة Growth على اتصال Primary: allowed=${gateOnPrimary.allowed}, code=${gateOnPrimary.code}, msg="${gateOnPrimary.message}"`);

  const gateOnGrowth = featureRequiresGrowth('growth_ad_management', 'growth');
  console.log(`   - محاولة ميزة Growth على اتصال Growth: allowed=${gateOnGrowth.allowed}`);

  if (gateOnPrimary.allowed || gateOnPrimary.code !== 'REAUTH_REQUIRED' || !gateOnGrowth.allowed) {
    throw new Error('❌ فشل فحص بوابة الميزات');
  }

  // 8️⃣ اختبار تعطيل Growth والتراجع التلقائي إلى Primary (Rollback Isolation)
  console.log('\n--- [8/8] اختبار تعطيل Growth والتراجع الآمن (Rollback & Isolation) ---');
  await metaAppRegistry.toggleAppStatus('growth', false);
  const updatedGrowth = await prisma.facebookApp.findUnique({ where: { key: 'growth' } });
  console.log(`✅ حالة تطبيق Growth بعد التعطيل: isActive = ${updatedGrowth.isActive}`);

  const fallbackConfig = await metaAppRegistry.getAppByKey('growth');
  console.log(`✅ عند استدعاء growth وهو معطل، يرجع fallback إلى Primary: appId=${fallbackConfig.appId}`);
  if (fallbackConfig.appId !== DEFAULT_FACEBOOK_APP_ID) {
    throw new Error('❌ لم يتم التراجع التلقائي إلى Primary عند تعطيل Growth');
  }

  // إعادة تفعيل Growth
  await metaAppRegistry.toggleAppStatus('growth', true);

  // تنظيف السجلات التجريبية
  await prisma.facebookPage.deleteMany({ where: { pageId: testGrowthPageId } });
  await prisma.webhookEventDedupe.deleteMany({ where: { externalMessageId: testMid } });

  console.log('\n================================================================');
  console.log('🎉 [T13 VERIFICATION SUCCESS] كافة المعايير الثمانية اجتازت بنجاح!');
  console.log('================================================================\n');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ خطأ أثناء التحقق:', err);
    process.exit(1);
  });
