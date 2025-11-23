# Material Symbols Outlined 字体文件

请从以下任一方式获取 Material Symbols Outlined 可变字体文件：

## 方法 1: 从 Google Fonts 下载（推荐）

1. 访问 [Google Fonts Material Symbols Outlined](https://fonts.google.com/icons?selected=Material+Symbols+Outlined)
2. 点击右上角的"下载"按钮
3. 下载后解压，找到 `MaterialSymbolsOutlined[wght].woff2` 文件
4. 将文件复制到此目录下

## 方法 2: 使用浏览器开发者工具下载

1. 打开浏览器，访问：https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200
2. 查看 CSS 文件中的 `url()` 链接
3. 打开链接下载 `.woff2` 文件
4. 将文件重命名为 `MaterialSymbolsOutlined[wght].woff2` 并放在此目录

## 方法 3: 从 GitHub 下载

1. 访问：https://github.com/google/material-design-icons/tree/master/variablefont
2. 下载 `MaterialSymbolsOutlined[wght].woff2` 文件
3. 将文件放在此目录下

## 文件结构

下载完成后，此目录应该包含：
```
public/fonts/
  └── MaterialSymbolsOutlined[wght].woff2
```

## 验证

下载完成后，运行 `npm run dev`，如果图标正常显示，说明字体文件已正确安装。

## 注意

- 文件大小约为 100-200 KB
- 只需要 `.woff2` 格式即可，这是现代浏览器支持的格式
- 文件名必须包含方括号：`MaterialSymbolsOutlined[wght].woff2`
