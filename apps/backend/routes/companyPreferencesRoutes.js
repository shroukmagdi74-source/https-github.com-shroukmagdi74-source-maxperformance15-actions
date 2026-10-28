/**
 * @file companyPreferencesRoutes.js
 * @description مسارات تفضيلات الشركة وتخصيص القائمة الجانبية
 */

const express = require('express');
const router = express.Router();
const verifyToken = require('../utils/verifyToken');
const companyPreferencesController = require('../controller/companyPreferencesController');

// حماية المسار بنفس middleware الشركة (المصادقة والتحقق من هوية المستخدم)
router.use(verifyToken.authenticateToken);

router.get('/sidebar-preferences', companyPreferencesController.getSidebarPreferences);
router.put('/sidebar-preferences', companyPreferencesController.updateSidebarPreferences);

module.exports = router;
