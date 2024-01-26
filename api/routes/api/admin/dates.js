import { Router } from 'express';
import * as XLSX from 'xlsx/xlsx.mjs';
import path from 'node:path';

import validateDate from '../../../middlewares/validateDate.js';
import { addDate, updateDate, deleteDate } from '../../../lib/db.js';

const router = Router();

router.get('/', function(req, res) {

  res.json({
    data: {
      hello: 'world'
    }
  })

});

router.get('/:dateId/download', function(req, res) {

  const rows = [
    { name: "George Washington", birthday: "1732-02-22" },
    { name: "John Adams", birthday: "1735-10-19" },
    { name: "", birthday: "" },
    { name: "John Adams", birthday: "1735-10-19" },
  ];

  const rows2 = [
    { name: "", birthday: "" },
    { name: "TEST", birthday: "TEST" },
  ];

  const workSheet = XLSX.utils.json_to_sheet(rows, {
    //header: ['one', 'two'],
    //skipHeader: true,
  });

  XLSX.utils.sheet_add_json(workSheet, rows2, { origin: rows.length, skipHeader: true });

  /* calculate column width */
  const max_width = rows.reduce((w, r) => Math.max(w, r.name.length), 10);
  workSheet["!cols"] = [ { wch: max_width }, { wch: max_width }  ];

  /*
  const merge = [
    { s: { r: 1, c: 0 }, e: { r: 2, c: 0 } },{ s: { r: 3, c: 0 }, e: { r: 4, c: 0 } },
  ];
  workSheet["!merges"] = merge;
  */

  const workBook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workBook, workSheet, "Dates");

  const data = XLSX.write(workBook, { type: 'buffer' });

  /* fix headers */
  //XLSX.utils.sheet_add_aoa(workSheet, [["Name", "Birthday"]], { origin: "A1" });

  res.send(data);

});

router.post('/', validateDate, function(req, res) {

  const { day, locationId } = req.body;

  const date = addDate(locationId, day);

  if (date) {

    return res.json({
      data: {
        date
      }
    });

  }

  return res.status(500)
  .json({
    data: {
      message: 'Internal Server Error'
    }
  });

});

router.put('/:dateId', validateDate, function(req, res) {

  const dateId = req.params.dateId;
  const { day, locationId } = req.body;

  const date = updateDate(dateId, locationId, day);

  if (date) {

    return res.json({
      data: {
        date
      }
    });

  }

  return res.status(500)
  .json({
    data: {
      message: 'Internal Server Error'
    }
  });

});

router.delete('/:dateId', function(req, res) {

  const dateId = req.params.dateId;

  if (!isNaN(dateId) && dateId > 0) {

    const result = deleteDate(dateId);

    if ([0, 1].includes(result)) {
  
      return res.json({
        data: {
          message: 'OK'
        }
      });
  
    }

  }

  return res.status(500)
  .json({
    data: {
      message: 'Internal Server Error'
    }
  });

});

export default router;