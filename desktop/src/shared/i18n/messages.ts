export type Lang = "en" | "zh";

export const LANG_STORAGE_KEY = "buzz-desktop-lang";

/** Default per product decision: Chinese. */
export const DEFAULT_LANG: Lang = "zh";

const en = {
  // Top chrome
  "chrome.toggleSidebar": "Toggle Sidebar",
  "chrome.back": "Go back",
  "chrome.forward": "Go forward",
  "chrome.language": "Language",
  "chrome.lang.en": "EN",
  "chrome.lang.zh": "中文",

  // Sidebar primary
  "nav.inbox": "Inbox",
  "nav.pulse": "Pulse",
  "nav.projects": "Projects",
  "nav.agents": "Agents",
  "nav.workflows": "Workflows",
  "nav.channels": "Channels",
  "nav.forums": "Forums",
  "nav.directMessages": "Direct messages",
  "nav.starred": "Starred",
  "nav.settings": "Settings",
  "nav.browseChannels": "Browse channels",
  "nav.newForum": "New forum",
  "nav.newMessage": "New message",
  "nav.createChannel": "Create channel",
  "nav.sectionDirectMessages": "direct messages",

  // Search
  "search.placeholder": "Search",
  "search.everything": "Search everything",
  "search.channels": "Channels",
  "search.directMessages": "Direct messages",
  "search.users": "People",
  "search.agents": "Agents",
  "search.mostRelevant": "Most relevant",
  "search.actions": "Actions",
  "search.browseChannels": "Browse channels",
  "search.createChannel": "Create a new channel",
  "search.createAgent": "Create a new agent",
  "search.directMessage": "Direct message",
  "search.noResults": "No results",
  "search.noMatches": "No matches for",
  "search.noMatchesFor": "No matches for {query}.",
  "search.noRecentActivity": "No recent activity yet.",
  "search.recentActivity": "Recent activity",
  "search.thread": "Thread",
  "search.message": "Message",
  "search.threadIn": "Thread in",
  "search.messageIn": "Message in",

  // Settings nav groups
  "settings.group.personal": "Personal",
  "settings.group.communities": "Communities",
  "settings.group.app": "App",
  "settings.back": "Back",
  "settings.backToApp": "Back to app",
  "settings.checkingInvitePermissions": "Checking invite permissions…",
  "settings.inviteCheckFailed": "Invite settings could not be checked.",
  "settings.tryAgain": "Try again",
  "settings.inviteUnavailable":
    "Invite settings are unavailable. Relay recovery may still be in progress.",
  "settings.title": "Settings",

  // Settings sections
  "settings.section.appearance": "Appearance",
  "settings.section.profile": "Profile",
  "settings.section.notifications": "Notifications",
  "settings.section.experimental": "Experiments",
  "settings.section.agents": "Agents",
  "settings.section.channel-templates": "Templates",
  "settings.section.compute": "Compute",
  "settings.section.shortcuts": "Shortcuts",
  "settings.section.hosted-communities": "Hosted communities",
  "settings.section.community-members": "Invites",
  "settings.section.moderation": "Moderation",
  "settings.section.custom-emoji": "Custom emoji",
  "settings.section.local-archive": "Local archive",
  "settings.section.mobile": "Mobile",
  "settings.section.updates": "Updates",

  // Appearance
  "appearance.title": "Appearance",
  "appearance.description": "Choose a theme for Buzz.",
  "appearance.mode.system": "System",
  "appearance.mode.light": "Light",
  "appearance.mode.dark": "Dark",
  "appearance.language.title": "Language",
  "appearance.language.description":
    "Interface language for the desktop app. Saved on this device.",
  "appearance.language.zh": "中文",
  "appearance.language.en": "English",
  "appearance.shellStyle.title": "Theme style",
  "appearance.shellStyle.description":
    "Independent full themes (sidebar, content, primary, borders). Not a skin on dark. Saved on this device.",
  "appearance.accent.title": "Accent color",
  "appearance.threadLayout.title": "Thread layout",
  "appearance.threadLayout.focus": "Focus",
  "appearance.threadLayout.focusDescription":
    "Threads open over the channel, full width",
  "appearance.threadLayout.split": "Split",
  "appearance.threadLayout.splitDescription":
    "Threads open in a side panel next to the channel",
  "appearance.shell.raft": "Raft",
  "appearance.shell.raft.blurb": "Cream + amber (home_portal)",
  "appearance.shell.persona5": "Persona 5",
  "appearance.shell.persona5.blurb": "Red / black / white · sharp",
  "appearance.shell.persona5max": "Persona 5 Max",
  "appearance.shell.persona5max.blurb": "Full red · comic panels",
  "appearance.shell.brutstack": "Brutstack",
  "appearance.shell.brutstack.blurb": "Cool gray + electric blue",
  "appearance.shell.limepunch": "LimePunch",
  "appearance.shell.limepunch.blurb": "Paper white + acid green",
  "appearance.shell.coralink": "CoralInk",
  "appearance.shell.coralink.blurb": "Peach + coral orange",
  "appearance.shell.rosebrick": "RoseBrick",
  "appearance.shell.rosebrick.blurb": "Off-white + rose",
  "appearance.shell.tealblock": "TealBlock",
  "appearance.shell.tealblock.blurb": "Mint + teal",
  "appearance.shell.violetpaper": "VioletPaper",
  "appearance.shell.violetpaper.blurb": "Lilac + violet",
  "appearance.shell.skypost": "SkyPost",
  "appearance.shell.skypost.blurb": "Sky paper + azure",
  "appearance.shell.inkmono": "InkMono",
  "appearance.shell.inkmono.blurb": "High-contrast mono",

  // Settings panels (Owner-visible paths must switch with language)
  "settings.profile.title": "Profile",
  "settings.profile.description":
    "Update how your name, avatar, and bio appear across Buzz.",
  "settings.profile.displayName": "Display name",
  "settings.profile.about": "Profile description",
  "settings.profile.notSet": "Not set",
  "settings.profile.saved": "Profile saved",
  "settings.profile.publicKey": "Public key",
  "settings.profile.privateKey": "Private key",
  "settings.profile.yourProfile": "Your profile",
  "settings.notifications.title": "Notifications",
  "settings.notifications.description":
    "Choose which alerts Buzz shows on this device.",
  "settings.agents.title": "Agents",
  "settings.agents.description":
    "Defaults and power options for agents on this device.",
  "settings.experiments.title": "Experiments",
  "settings.experiments.description":
    "Optional features that may change or be removed.",
  "settings.shortcuts.title": "Keyboard shortcuts",
  "settings.shortcuts.description": "Reference for desktop shortcuts.",
  "settings.mobile.title": "Mobile",
  "settings.mobile.description": "Pair a phone or tablet with this desktop.",
  "settings.updates.title": "Software Updates",
  "settings.updates.description": "Check for and install Buzz updates.",
  "settings.channelTemplates.title": "Channel templates",
  "settings.channelTemplates.description":
    "Reusable channel setups for new communities.",
  "settings.hostedCommunities.title": "Hosted communities",
  "settings.hostedCommunities.description":
    "Communities hosted for you on Buzz infrastructure.",
  "settings.moderation.title": "Moderation",
  "settings.moderation.description": "Review reports and take action.",
  "settings.agentRuntimes.title": "Agent runtimes",
  "settings.agentRuntimes.description":
    "Choose which agent tools Buzz can use on this device.",
  "settings.agentDefaults.title": "Agent defaults",

  // Common actions
  "common.retry": "Retry",
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.close": "Close",
  "common.create": "Create",
  "common.delete": "Delete",
  "common.loading": "Loading…",
  "common.empty": "Nothing here yet",
  "common.signOut": "Sign out",
  "common.markAsRead": "Mark as read",
  "common.error": "Something went wrong",
  "common.copied": "Copied to clipboard",
} as const;

export type MsgKey = keyof typeof en;

const zh: Record<MsgKey, string> = {
  "chrome.toggleSidebar": "切换侧栏",
  "chrome.back": "后退",
  "chrome.forward": "前进",
  "chrome.language": "语言",
  "chrome.lang.en": "EN",
  "chrome.lang.zh": "中文",

  "nav.inbox": "收件箱",
  "nav.pulse": "动态",
  "nav.projects": "项目",
  "nav.agents": "智能体",
  "nav.workflows": "工作流",
  "nav.channels": "频道",
  "nav.forums": "论坛",
  "nav.directMessages": "私信",
  "nav.starred": "已加星标",
  "nav.settings": "设置",
  "nav.browseChannels": "浏览频道",
  "nav.newForum": "新建论坛",
  "nav.newMessage": "新消息",
  "nav.createChannel": "创建频道",
  "nav.sectionDirectMessages": "私信",

  "search.placeholder": "搜索",
  "search.everything": "搜索全部",
  "search.channels": "频道",
  "search.directMessages": "私信",
  "search.users": "用户",
  "search.agents": "智能体",
  "search.mostRelevant": "最相关",
  "search.actions": "操作",
  "search.browseChannels": "浏览频道",
  "search.createChannel": "创建新频道",
  "search.createAgent": "创建新智能体",
  "search.directMessage": "私信",
  "search.noResults": "无结果",
  "search.noMatches": "无匹配：",
  "search.noMatchesFor": "无匹配：{query}。",
  "search.noRecentActivity": "暂无最近活动。",
  "search.recentActivity": "最近活动",
  "search.thread": "帖子",
  "search.message": "消息",
  "search.threadIn": "帖子位于",
  "search.messageIn": "消息位于",

  "settings.group.personal": "个人",
  "settings.group.communities": "社区",
  "settings.group.app": "应用",
  "settings.back": "返回",
  "settings.backToApp": "返回应用",
  "settings.checkingInvitePermissions": "正在检查邀请权限…",
  "settings.inviteCheckFailed": "无法检查邀请设置。",
  "settings.tryAgain": "重试",
  "settings.inviteUnavailable": "邀请设置暂不可用。中继恢复可能仍在进行。",
  "settings.title": "设置",

  "settings.section.appearance": "外观",
  "settings.section.profile": "个人资料",
  "settings.section.notifications": "通知",
  "settings.section.experimental": "实验功能",
  "settings.section.agents": "智能体",
  "settings.section.channel-templates": "模板",
  "settings.section.compute": "算力",
  "settings.section.shortcuts": "快捷键",
  "settings.section.hosted-communities": "托管社区",
  "settings.section.community-members": "邀请",
  "settings.section.moderation": "审核",
  "settings.section.custom-emoji": "自定义表情",
  "settings.section.local-archive": "本地归档",
  "settings.section.mobile": "移动端",
  "settings.section.updates": "更新",

  "appearance.title": "外观",
  "appearance.description": "为 Buzz 选择主题。",
  "appearance.mode.system": "跟随系统",
  "appearance.mode.light": "浅色",
  "appearance.mode.dark": "深色",
  "appearance.language.title": "语言",
  "appearance.language.description": "桌面端界面语言，保存在本机。",
  "appearance.language.zh": "中文",
  "appearance.language.en": "English",
  "appearance.shellStyle.title": "主题风格",
  "appearance.shellStyle.description":
    "独立完整主题（侧栏、正文、主色、边框），不是深色主题上的皮肤。保存在本机。",
  "appearance.accent.title": "强调色",
  "appearance.threadLayout.title": "帖子布局",
  "appearance.threadLayout.focus": "专注",
  "appearance.threadLayout.focusDescription": "帖子覆盖频道，全宽打开",
  "appearance.threadLayout.split": "分栏",
  "appearance.threadLayout.splitDescription": "帖子在频道旁侧栏打开",
  "appearance.shell.raft": "Raft",
  "appearance.shell.raft.blurb": "奶油 + 琥珀黄（home_portal）",
  "appearance.shell.persona5": "Persona 5",
  "appearance.shell.persona5.blurb": "红黑白 · 锐角",
  "appearance.shell.persona5max": "Persona 5 Max",
  "appearance.shell.persona5max.blurb": "全红 · 漫画分镜感",
  "appearance.shell.brutstack": "Brutstack",
  "appearance.shell.brutstack.blurb": "冷灰 + 电蓝",
  "appearance.shell.limepunch": "LimePunch",
  "appearance.shell.limepunch.blurb": "纸白 + 酸绿",
  "appearance.shell.coralink": "CoralInk",
  "appearance.shell.coralink.blurb": "浅桃 + 珊瑚橙",
  "appearance.shell.rosebrick": "RoseBrick",
  "appearance.shell.rosebrick.blurb": "米白 + 玫红",
  "appearance.shell.tealblock": "TealBlock",
  "appearance.shell.tealblock.blurb": "薄荷 + 青绿",
  "appearance.shell.violetpaper": "VioletPaper",
  "appearance.shell.violetpaper.blurb": "浅紫 + 紫罗兰",
  "appearance.shell.skypost": "SkyPost",
  "appearance.shell.skypost.blurb": "天空纸 + 天蓝",
  "appearance.shell.inkmono": "InkMono",
  "appearance.shell.inkmono.blurb": "高对比黑白",

  "settings.profile.title": "个人资料",
  "settings.profile.description": "更新你在 Buzz 中显示的名称、头像与简介。",
  "settings.profile.displayName": "显示名称",
  "settings.profile.about": "个人简介",
  "settings.profile.notSet": "未设置",
  "settings.profile.saved": "个人资料已保存",
  "settings.profile.publicKey": "公钥",
  "settings.profile.privateKey": "私钥",
  "settings.profile.yourProfile": "你的资料",
  "settings.notifications.title": "通知",
  "settings.notifications.description": "选择本机显示哪些提醒。",
  "settings.agents.title": "智能体",
  "settings.agents.description": "本机智能体的默认项与电源选项。",
  "settings.experiments.title": "实验功能",
  "settings.experiments.description": "可选功能，可能变更或移除。",
  "settings.shortcuts.title": "键盘快捷键",
  "settings.shortcuts.description": "桌面端快捷键参考。",
  "settings.mobile.title": "移动端",
  "settings.mobile.description": "将手机或平板与此桌面端配对。",
  "settings.updates.title": "软件更新",
  "settings.updates.description": "检查并安装 Buzz 更新。",
  "settings.channelTemplates.title": "频道模板",
  "settings.channelTemplates.description": "用于新社区的可复用频道配置。",
  "settings.hostedCommunities.title": "托管社区",
  "settings.hostedCommunities.description": "由 Buzz 基础设施托管的社区。",
  "settings.moderation.title": "审核",
  "settings.moderation.description": "查看举报并采取措施。",
  "settings.agentRuntimes.title": "智能体运行时",
  "settings.agentRuntimes.description": "选择本机可供 Buzz 使用的智能体工具。",
  "settings.agentDefaults.title": "智能体默认值",

  "common.retry": "重试",
  "common.cancel": "取消",
  "common.save": "保存",
  "common.close": "关闭",
  "common.create": "创建",
  "common.delete": "删除",
  "common.loading": "加载中…",
  "common.empty": "暂无内容",
  "common.signOut": "退出登录",
  "common.markAsRead": "标为已读",
  "common.error": "出错了",
  "common.copied": "已复制到剪贴板",
};

export const messages: Record<Lang, Record<MsgKey, string>> = {
  en: en as Record<MsgKey, string>,
  zh,
};

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "zh";
}

export function translate(
  key: MsgKey,
  lang: Lang,
  vars?: Record<string, string | number>,
): string {
  let text = messages[lang][key] ?? messages.en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value));
    }
  }
  return text;
}

/** Read lang from a storage-like object (localStorage or test double). */
export function loadStoredLang(
  storage: Pick<Storage, "getItem"> | null | undefined,
): Lang {
  try {
    const stored = storage?.getItem(LANG_STORAGE_KEY);
    if (isLang(stored)) {
      return stored;
    }
  } catch {
    // ignore
  }
  return DEFAULT_LANG;
}

/** Persist lang; returns false if storage write failed. */
export function persistLang(
  storage: Pick<Storage, "setItem"> | null | undefined,
  lang: Lang,
): boolean {
  if (!isLang(lang)) {
    return false;
  }
  try {
    storage?.setItem(LANG_STORAGE_KEY, lang);
    return true;
  } catch {
    return false;
  }
}
