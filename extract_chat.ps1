$content = Get-Content app.js

$importsChat = "import { db } from '../api/db.js';
import { showToast } from '../utils/ui.js';

"

function Extract-And-Export($start, $end) {
    $block = $content[($start-1)..($end-1)] -join "
"
    $block = $block -replace "(?m)^window\.(render[a-zA-Z0-9_]+) = function\s*\(", "export function $1("
    $block = $block -replace "(?m)^window\.(selectChatThread) = function\s*\(", "export function $1("
    $block = $block -replace "(?m)^window\.(sendInboxMessage) = function\s*\(", "export function $1("
    $block = $block -replace "(?m)^window\.(filterChatThreads) = function\s*\(", "export function $1("
    $block = $block -replace "(?m)^function updateUnreadBadges", "export function updateUnreadBadges"
    return $block -replace "(?m)^function render", "export function render"
}

Set-Content src\views\chat.js ($importsChat + (Extract-And-Export 1437 1689))

