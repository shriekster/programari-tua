import { Router } from 'express';

const router = Router();

router.post('/', function(req, res) {

    console.log(req.body)

    res.json({
        data: {
        hello: 'world'
        }
    })

});

export default router;