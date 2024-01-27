import { Router } from 'express';
import * as XLSX from 'xlsx/xlsx.mjs';
import path from 'node:path';

import validateDate from '../../../middlewares/validateDate.js';
import { addDate, updateDate, deleteDate, exportDate } from '../../../lib/db.js';

const router = Router();

router.get('/', function(req, res) {

  res.json({
    data: {
      hello: 'world'
    }
  })

});

router.get('/:dateId/download', function(req, res) {

  const dateId = req.params.dateId;

  if (!isNaN(dateId) && dateId > 0) {

    const result = exportDate(dateId);

    if (!result?.error) {

      if (result?.rows && result?.cellMerges) {

        const rows = result.rows;
        const cellMerges = result.cellMerges;

        const workSheet = XLSX.utils.json_to_sheet(rows, {
          skipHeader: true,
        });

        /* calculate column widths */
        const w1 = rows.reduce((w, r) => Math.max(w, r.c1.length), 10);
        const w2 = rows.reduce((w, r) => Math.max(w, r.c2.length), 10);
        const w3 = rows.reduce((w, r) => Math.max(w, r.c3.length), 10);
        const w4 = rows.reduce((w, r) => Math.max(w, r.c4.length), 10);

        workSheet["!cols"] = [ 
          { wch: w1 }, 
          { wch: w2 }, 
          { wch: w3 }, 
          { wch: w4 }, 
        ];

        workSheet["!merges"] = cellMerges;

        const workBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, workSheet, 'Participanti TUA');

        const data = XLSX.write(workBook, { type: 'buffer' });

        return res.status(200)
        .send(data);

      }

      return res.status(418)
      .json({
        data: {
          message: `I'm A Teapot`
        }
      });

    }

    return res.status(500)
    .json({
      data: {
        message: 'Internal Server Error'
      }
    });

  }

  return res.status(400)
  .json({
    data: {
      message: 'Bad Request'
    }
  });

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