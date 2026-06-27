$content = Get-Content app.js

$importsDir = "import { db, dbUpdateApplication, dbInsertApplication } from '../api/db.js';
import { showToast, openModal } from '../utils/ui.js';

"
$importsChat = "import { db } from '../api/db.js';
import { showToast } from '../utils/ui.js';

"

function Extract-And-Export($start, $end) {
    $block = $content[($start-1)..($end-1)] -join "
"
    $block = $block -replace "(?m)^window\.(render[a-zA-Z0-9_]+) = function\s*\(", "export function $1("
    return $block -replace "(?m)^function render", "export function render"
}

Set-Content src\views\directories.js ($importsDir + (Extract-And-Export 1058 1436))
Set-Content src\views\chat.js ($importsChat + (Extract-And-Export 1437 1540))

