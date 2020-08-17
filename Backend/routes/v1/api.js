import crypto from 'crypto'
import async from 'async'

var mysql_dbc = require('../../db/db_con')()
var connection = mysql_dbc.init()

require('dotenv').config({silent: true})

/**
 * @swagger
 * tags:
 *   name: SignUp
 *   description: 회원가입 처리
 * definitions:
 *   SignUp_Auth_request:
 *     type: object
 *     required:
 *       - id
 *       - name
 *       - password1
 *       - password2
 *     properties:
 *       id:
 *         type: string
 *         description: 아이디
 *       name:
 *         type: string
 *         description: 이름
 *       password1:
 *         type: string
 *         description: 비밀번호
 *       password2:
 *         type: string
 *         description: 비밀번호 확인
 *   SignUp_Auth_response:
 *     type: object
 *     required:
 *       - code
 *     properties:
 *       code:
 *         type: integer
 *         description: Response Code
 *       v:
 *         type: string
 *         description: api version
 *       status:
 *         type: string
 *         description: 회원가입 성공 여부- SUCCESS, ERR
 *       detail:
 *         type: string
 *         description: api 실행 결과
 *   SignUp_Response_error:
 *     type: object
 *     required:
 *       - code
 *     properties:
 *       code:
 *         type: integer
 *         description: Response Code
 *       v:
 *         type: string
 *         description: api version
 *       status:
 *         type: string
 *         description: 회원가입 성공 여부- SUCCESS, ERR
 *       detail:
 *         type: object
 *         properties:
 *           err: 
 *             type: string
 *             description: 오류 요약
 *           message: 
 *             type: string
 *             description: 오류 내용
 */

 /**
 * @swagger
 *  paths:
 *    /v1/auth/signup:
 *      post:
 *        tags:
 *        - "SignUp"
 *        summary: "SignUp process"
 *        description: ""
 *        consumes:
 *        - "application/json"
 *        produces:
 *        - "application/json"
 *        parameters:
 *        - in: "body"
 *          name: "body"
 *          description: "회원가입 계정 정보와 서비스 정보를 전달"
 *          required: true
 *          schema:
 *            $ref: "#/definitions/SignUp_Auth_request"
 *        responses:
 *          200:
 *            description: "회원가입 결과"
 *            schema:
 *              $ref: "#/definitions/SignUp_Auth_response"
 *          400:
 *            description: "잘못된 데이터"
 *            schema:
 *              $ref: "#/definitions/SignUp_Response_error"
 *          500:
 *            description: "회원가입 오류 & 실패"
 *            schema:
 *              $ref: "#/definitions/SignUp_Response_error"
 */

export const signUp = ((req, res) => {
    var {
        id,
        name,
        password1,
        password2
    } = req.body
    if (id > 50) {
        id = id.slice(0, 50)
    }
    if (name > 50) {
        name = name.slice(0, 50)
    }
    if (!id || !name || !password1 || !password2) {
        res.statusCode(400).json({
            code: 400,
            v: 'v1',
            status: 'ERR',
            detail: {
                err: 'FORMAT',
                message: 'INVAILD FORMAT'
            }
        })
    } else {
        async.waterfall([
                (callback) => {
                    password1 = crypto.createHash('sha512').update(crypto.createHash('sha512').update(password1).digest('base64')).digest('base64');
                    password2 = crypto.createHash('sha512').update(crypto.createHash('sha512').update(password2).digest('base64')).digest('base64');
                    var sql = 'SELECT count(*) as count FROM user_list WHERE id = ? OR name = ?'
                    connection.query(sql, [id, name], (err, result) => {
                        if (err) {
                            callback({
                                err: 'QUERY',
                                message: 'QUERY ERROR'
                            })
                        } else if (password1 == password2) {
                            if (result[0].count > 0) {
                                callback({
                                    err: 'ERR_SIGNUP',
                                    message: 'USER_ID OR NAME ALREADY EXISTS'
                                })
                            } else {
                                callback(null, '')
                            }
                        } else {
                            callback({
                                err: 'ERR_SIGNUP',
                                message: 'PASSWORD NOT MATCHED'
                            })
                        }
                    })
                },
                (resultData, callback) => {
                    var sql = 'INSERT INTO user_list (id, name, password) values(?, ?, ?)'
                    connection.query(sql, [id, name, password1], (err, result) => {
                        if (err) {
                            callback({
                                err: 'QUERY',
                                message: 'QUERY ERROR'
                            })
                        } else {
                            callback(null, '')
                        }
                    })
                }
            ],
            (err, result) => {
                if (err) {
                    res.statusCode(500).json({
                        code: 500,
                        v: 'v1',
                        status: 'ERR_SIGNUP',
                        detail: err
                    })
                } else {
                    res.json({
                        code: 200,
                        v: 'v1',
                        status: 'SUCCESS',
                        detail: 'Sign up successful!'
                    })
                }
            })
    }
})

export const signIn = ((req, res) => {
    var {
        id,
        password
    } = req.body
    if (!id || !password) {
        res.json({
            code: 500,
            v: 'v1',
            status: 'ERR',
            detail: 'INVALID FORMAT'
        })
    } else {
        async.waterfall([
                (callback) => {
                    password = crypto.createHash('sha512').update(crypto.createHash('sha512').update(password).digest('base64')).digest('base64');
                    var sql = 'SELECT count(*) as count FROM user_list WHERE id = ? AND password = ?'
                    connection.query(sql, [id, password], (err, result) => {
                        if (err) {
                            callback({
                                err: 'QUERY',
                                message: 'QUERY ERROR'
                            })
                        } else {
                            if (result[0].count == 0) {
                                callback({
                                    err: 'ERR_SIGNIN',
                                    message: 'INVALID PASSWORD OR ID'
                                })
                            } else {
                                callback(null, '')
                            }
                        }
                    })
                }
            ],
            (err, result) => {
                if (err) {
                    res.json({
                        code: 500,
                        v: 'v1',
                        status: 'ERR_SIGNIN',
                        detail: err
                    })
                } else {
                    res.json({
                        code: 200,
                        v: 'v1',
                        status: 'SUCCESS',
                        detail: 'Sign in successful!'
                    })
                }
            })
    }
})
