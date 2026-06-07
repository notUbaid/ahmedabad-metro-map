import * as xlsx from 'xlsx';

const workbook = xlsx.readFile('public/Ahmedabad_Metro_Master_Database_V2.xlsx');

console.log("Sheet Names:", workbook.SheetNames);

workbook.SheetNames.forEach(name => {
  console.log(`\n--- Sheet: ${name} ---`);
  const sheet = workbook.Sheets[name];
  const data = xlsx.utils.sheet_to_json(sheet);
  console.log(`Total rows: ${data.length}`);
  console.log(data.slice(0, 5)); // Print first 5 rows to understand the structure
});
