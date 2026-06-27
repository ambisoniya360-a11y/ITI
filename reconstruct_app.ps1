$content = Get-Content app.js

$imports = "import { renderAllViews } from './src/views/index.js';
"

$part1 = $content[0..151] -join "
"
$part2 = $content[670..1056] -join "
"
$part3 = $content[1689..($content.Length - 1)] -join "
"

$newContent = $imports + $part1 + "
" + $part2 + "
" + $part3
Set-Content app.js $newContent
