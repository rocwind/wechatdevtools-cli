# wechatdevtools-cli

---

### 一个微信开发者工具命令行的调用工具(命令行).

- 主要实现的功能是让这个命令行工具在 Windows (测过 win10x64) 和 macOS 通用:
  - Windows 根据注册表找微信开发者工具的安装路径并调用
  - macOS 找/Applications 的默认路径调用
- 另外针对需要杀掉开发者工具进程的场景添加了一个 `--kill` 的命令.

### 使用方法:

- `npm install -g wechatdevtools-cli`: 安装命令行
- `wechatdevtools --kill`: 杀掉微信开发者工具的进程
- `wechatdevtools [options]`: 调用微信开发者工具命令行, [详细的参数列表见官方文档](https://developers.weixin.qq.com/miniprogram/dev/devtools/cli.html)
