const fs = require('fs');
const xlsx = require('xlsx');

function parseTrainJourneys() {
  console.log('Reading Excel file...');
  const workbook = xlsx.readFile('public/Ahmedabad_Metro_Master_Database_V2.xlsx');
  
  // We will structure the data by Train_ID
  const trains = {};

  workbook.SheetNames.forEach(sheetName => {
    console.log(`Processing sheet: ${sheetName}`);
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    data.forEach(row => {
      const trainId = row.Train_ID;
      const dayType = row.Day_Type || 'All';
      if (!trainId) return;

      const uniqueId = `${trainId}_${dayType}`;

      if (!trains[uniqueId]) {
        trains[uniqueId] = {
          id: trainId,
          uniqueId: uniqueId,
          direction: row.Direction,
          dayType: dayType,
          route: row.Route || sheetName,
          stations: []
        };
      }

      trains[uniqueId].stations.push({
        order: row.Station_Order,
        name: String(row.Station_Name || '').trim(),
        arrivalTime: String(row.Arrival_Time || '').trim(),
        departureTime: String(row.Departure_Time || '').trim()
      });
    });
  });

  // Sort stations for each train by order
  Object.values(trains).forEach(train => {
    train.stations.sort((a, b) => a.order - b.order);
  });

  const outputPath = 'src/data/trainJourneys.json';
  fs.writeFileSync(outputPath, JSON.stringify(trains, null, 2));
  console.log(`Wrote detailed train journeys to ${outputPath}`);
  console.log(`Total unique trains parsed: ${Object.keys(trains).length}`);
}

parseTrainJourneys();
