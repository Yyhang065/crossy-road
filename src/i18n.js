export const translations = {
  en: {
    gameTitle: "CROSSY ROAD",
    tapToPlay: "TAP TO PLAY",
    updateLog: "UPDATE LOG",
    settings: "SETTINGS",
    paused: "PAUSED",
    resume: "RESUME",
    restart: "RESTART RUN",
    tabControls: "Controls",
    tabVideo: "Video",
    tabAudio: "Audio",
    tabLanguage: "Language",
    controlMode: "Control Mode",
    touchLayout: "Touch Layout",
    dpadOpacity: "D-Pad Opacity",
    shadows: "Shadows",
    cameraAngle: "Camera Angle",
    lockedIso: "Locked Isometric",
    masterVolume: "Master Volume",
    soundEffects: "Sound Effects",
    language: "Language",
    done: "DONE",
    close: "CLOSE",
    patchNotes: "Patch Notes"
  },
  zh: {
    gameTitle: "天天过马路",
    tapToPlay: "点击开始",
    updateLog: "更新日志",
    settings: "游戏设置",
    paused: "已暂停",
    resume: "继续游戏",
    restart: "重新开始",
    tabControls: "控制",
    tabVideo: "画面",
    tabAudio: "声音",
    tabLanguage: "语言",
    controlMode: "控制模式",
    touchLayout: "按键布局",
    dpadOpacity: "按键不透明度",
    shadows: "阴影质量",
    cameraAngle: "摄像机视角",
    lockedIso: "锁定等轴视角",
    masterVolume: "主音量",
    soundEffects: "游戏音效",
    language: "语言选择",
    done: "完成",
    close: "关闭",
    patchNotes: "更新记录"
  }
};

let currentLang = 'en';

export function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLang = lang;
  const dict = translations[lang];

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });
}
