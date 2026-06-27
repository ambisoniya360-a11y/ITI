// ─── Centralized Trade-to-Skills Mapping ───
// Single source of truth for all 25 NCVT/CTS ITI Trades
export function getSkillsForTrade(trade) {
  const tradeSkillsMap = {
    // Engineering Trades
    'Electrician': ['Industrial Wiring', 'Control Panels', 'Solar PV Install', 'Safety Protocols'],
    'Fitter': ['Lathe Operations', 'Technical Drawing', 'Pneumatics & Hydraulics', 'Precision Assembly'],
    'Welder': ['TIG Welding', 'MIG Welding', 'Structural Fabrication', 'Gas Cutting'],
    'Turner': ['Lathe Turning', 'Thread Cutting', 'Taper Turning', 'Precision Measurement'],
    'Machinist': ['Milling Operations', 'Surface Grinding', 'Tool Sharpening', 'CNC Basics'],
    'Electronics Mechanic': ['PCB Repair', 'Microcontrollers', 'Soldering & Desoldering', 'Circuit Testing'],
    'Refrigeration & AC': ['HVAC Systems', 'Refrigerant Handling', 'Compressor Repair', 'Thermostat Calibration'],
    'Mechanic Diesel': ['Fuel Injection Systems', 'Engine Overhaul', 'Turbocharger Maintenance', 'Emission Testing'],
    'Motor Mechanic (MMV)': ['Engine Diagnostics', 'Brake Systems', 'Transmission Repair', 'Vehicle Electrical'],
    'Wireman': ['Domestic Wiring', 'Cable Jointing', 'Switchgear Installation', 'Earthing Systems'],
    'Surveyor': ['Land Surveying', 'Total Station Operation', 'Auto Level', 'GIS Mapping'],
    'Draughtsman Civil': ['AutoCAD Drafting', 'Building Plan Design', 'Structural Detailing', 'Site Estimation'],
    'Draughtsman Mechanical': ['Mechanical CAD', 'Assembly Drawing', 'GD&T Standards', 'Machine Design'],
    'CNC Operator': ['CNC Programming', 'Precision Milling', 'Metrology', 'G-Code & M-Code'],
    'Solar Technician': ['Solar Panel Alignment', 'Inverter Commissioning', 'Battery Bank Setup', 'AC/DC Troubleshooting'],
    'IoT Technician': ['Sensor Integration', 'Arduino & Raspberry Pi', 'MQTT Protocol', 'Smart Device Setup'],
    'EV Technician': ['EV Battery Management', 'Charging Station Setup', 'Motor Controller Diagnostics', 'Regenerative Braking'],
    // Non-Engineering Trades
    'COPA': ['MS Office Suite', 'Internet & Networking', 'Programming Basics', 'Data Entry & Management'],
    'Stenographer': ['Shorthand Writing', 'Fast Typing (80+ WPM)', 'Office Management', 'Audio Transcription'],
    'Dress Making': ['Pattern Drafting', 'Fabric Cutting', 'Machine Stitching', 'Garment Finishing'],
    'Sewing Technology': ['Industrial Sewing Machines', 'Overlock Stitching', 'Quality Control', 'Fabric Analysis'],
    'Health Sanitary Inspector': ['Water Quality Testing', 'Food Safety Inspection', 'Waste Management', 'Epidemiology Basics'],
    'Food Production': ['Bakery & Confectionery', 'Indian Cuisine', 'Food Safety & Hygiene', 'Menu Planning'],
    'Hospitality Assistant': ['Front Office Operations', 'Housekeeping', 'Customer Service', 'Event Management'],
    'Digital Photographer': ['DSLR Camera Ops', 'Photo Editing (Lightroom)', 'Studio Lighting', 'Video Editing Basics']
  };
  return tradeSkillsMap[trade] || ['Industrial Safety', 'Basic Tools', 'Workshop Practice', 'Technical Drawing'];
}
