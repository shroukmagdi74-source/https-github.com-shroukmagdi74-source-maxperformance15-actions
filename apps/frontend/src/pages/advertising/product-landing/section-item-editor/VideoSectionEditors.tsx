import React from "react";
import { SingleSectionEditorProps } from "./types";
import { CommonSectionStylingFields } from "./CommonSectionStylingFields";

// 20. YOUTUBE_VIDEO EDITOR (EasyOrders "youtube-video")
export const YoutubeVideoSectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  return (
    <div className="eo-section-editor-body">
      <div className="eo-fields">
        <label>
          <span>عنوان الفيديو (اختياري):</span>
          <input
            type="text"
            value={content.title || ""}
            onChange={(e) => update({ title: e.target.value })}
            placeholder="شاهد تجربة واستعراض المنتج على يوتيوب"
          />
        </label>
        <label style={{ marginTop: 8 }}>
          <span>رابط أو معرف فيديو يوتيوب (URL or Video ID):</span>
          <input
            type="text"
            value={content.videoUrl || content.videoId || ""}
            onChange={(e) => update({ videoUrl: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=... أو معرف الفيديو"
            dir="ltr"
          />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
          <label>
            <span>نسبة الأبعاد (Aspect Ratio):</span>
            <select
              value={content.aspectRatio || "16/9"}
              onChange={(e) => update({ aspectRatio: e.target.value })}
            >
              <option value="16/9">عرض أفقي قياسي (16:9)</option>
              <option value="9/16">عمودي شورتس / ريلز (9:16 Shorts)</option>
              <option value="4/3">مربع / كلاسيكي (4:3)</option>
            </select>
          </label>
          <label>
            <span>التشغيل التلقائي:</span>
            <select
              value={content.autoplay ? "true" : "false"}
              onChange={(e) => update({ autoplay: e.target.value === "true" })}
            >
              <option value="false">معطل (يبدأ بالنقر)</option>
              <option value="true">مفعل (بدون صوت Autoplay Muted)</option>
            </select>
          </label>
        </div>
        <label style={{ marginTop: 8 }}>
          <span>وصف أو تعليق أسفل الفيديو:</span>
          <input
            type="text"
            value={content.videoCaption || ""}
            onChange={(e) => update({ videoCaption: e.target.value })}
            placeholder="فيديو استعراض واقعي بدون فلاتر"
          />
        </label>
        <CommonSectionStylingFields content={content} update={update} />
      </div>
    </div>
  );
};

// 14. VIDEO_REEL EDITOR
export const VideoReelSectionEditor: React.FC<SingleSectionEditorProps> = ({ content, update }) => {
  return (
    <div className="eo-section-editor-body">
      <div className="eo-fields">
        <label>
          <span>رابط الفيديو (Direct MP4 URL أو YouTube Embed):</span>
          <input
            type="text"
            value={content.videoUrl || ""}
            onChange={(e) => update({ videoUrl: e.target.value })}
            placeholder="https://.../video.mp4"
            dir="ltr"
          />
        </label>
        <label>
          <span>صورة غلاف الفيديو (Thumbnail):</span>
          <input
            type="text"
            value={content.videoThumbnail || ""}
            onChange={(e) => update({ videoThumbnail: e.target.value })}
            placeholder="https://.../thumbnail.jpg"
            dir="ltr"
          />
        </label>
        <label>
          <span>نص الشرح التوجيهي أسفل الفيديو:</span>
          <input
            type="text"
            value={content.videoCaption || ""}
            onChange={(e) => update({ videoCaption: e.target.value })}
            placeholder="شاهد تجربة المنتج والأنبوكسينغ على الطبيعة بدون فلاتر..."
          />
        </label>
      </div>
    </div>
  );
};
