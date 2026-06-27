$content = Get-Content app.js

$importsCharts = "import { db } from '../api/db.js';

"
Set-Content src\charts.js ($importsCharts + ($content[1378..1514] -join "
") + "
" + ($content[3557..3577] -join "
"))

$importsInteractions = "import { db, dbInsertStudent, dbUpdateApplication, dbInsertApplication, dbInsertJob } from './api/db.js';
import { showToast, openModal, closeModal } from './utils/ui.js';
import { renderAllViews, renderCompanyDashboard, renderCompanyKanban, renderStudentApplicationsList, renderStudentJobBoard, renderInstituteDirectory, renderCompanyDirectory, renderChatThreadsList, renderChatMessages } from './views/index.js';
import { initCharts } from './charts.js';

"

# Interactions are everything else that wasn't extracted
$interactionsContent = ($content[489..568] -join "
") + "
" + 
                       ($content[1060..1343] -join "
") + "
" +
                       ($content[2296..2440] -join "
") + "
" +
                       ($content[2786..3392] -join "
") + "
" +
                       ($content[3482..3556] -join "
")

Set-Content src\interactions.js ($importsInteractions + $interactionsContent)

# Export renderActiveHiring inside views\company.js
$importsCompany = "

"
Add-Content src\views\company.js ($importsCompany + ($content[3393..3480] -replace "^window\.renderActiveHiring = function", "export function renderActiveHiring" -join "
"))

