import express from 'express'
import * as API from './api'

const router = express.Router()

router.get('/', (req, res) => {
    res.json({
        code: 200,
        v: 'v1',
        status: 'OK'
    })
})

router.post('/auth/signup', API.signUp) // 회원가입 api

router.post('/auth/signin', API.signIn) // 로그인 api

export default router