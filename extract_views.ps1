$content = Get-Content app.js

$imports = "import { db, dbUpdateApplication, dbInsertApplication } from '../api/db.js';
import { showToast, openModal } from '../utils/ui.js';

"

function Extract-And-Export($start, $end) {
    $block = $content[($start-1)..($end-1)] -join "
"
    return $block -replace "(?m)^function render", "export function render"
}

Set-Content src\views\student.js ($imports + (Extract-And-Export 234 384))
Set-Content src\views\institute.js ($imports + (Extract-And-Export 385 450))
Set-Content src\views\company.js ($imports + (Extract-And-Export 451 563))
Set-Content src\views\admin.js ($imports + (Extract-And-Export 564 595))
Set-Content src\views\landing.js ($imports + (Extract-And-Export 163 233) + "
" + (Extract-And-Export 596 669))

