'use strict'

const express = require('express')
const users = require('../../controllers/v1/userController')
const account = require('../../controllers/v1/accountController')
const plans = require('../../controllers/v1/plansController')
const center = require('../../controllers/v1/centerController')
const process = require('../../controllers/v1/processController')
const chart = require('../../controllers/v1/chartController')
const mail = require('../../controllers/v1/mailerController')
const workshop = require('../../controllers/v1/workOrdersController')
const sms = require('../../controllers/v1/smsController')
const activity = require('../../controllers/v1/activityController')
const orderReport = require('../../controllers/v1/ordersReportsControllers')

const isAuth = require('../../middlewares/auth')
const api = express.Router()


api.get('/users', users.getUsers )

// Log In
api.post('/signin', users.signIn)
api.post('/getuserbyemail', users.getUserByEmail)
api.post('/mail/getNewPass', mail.getNewPass )
// End login

//Account
api.post('/account/newAccount',isAuth, account.newAccount)
api.post('/account/countAccount',isAuth, account.countAccount)
api.post('/account/getAccount',isAuth, account.getAccount)
api.post('/account/getAccountById/:id',isAuth, account.getAccountById)
api.post('/account/editAccount',isAuth, account.editAccount)
api.post('/account/getAccountIdToCenter', isAuth, account.getAccountIdToCenter)
api.post('/account/obtenerCuentaZonaClientes', account.obtenerCuentaZonaClientes)
//End Account

//Plans
api.post('/plans/newPlan',isAuth, plans.newPlan)
api.post('/plans/getPlans',isAuth, plans.getPlans)
api.post('/plans/deletPlans',isAuth, plans.deletPlans)
api.post('/plans/getPlanById/:id',isAuth, plans.getPlanById)


//Center
api.post('/center/centerCount',isAuth, center.centerCount)
api.post('/center/newCenter',isAuth, center.newCenter)
api.post('/center/getCenterById',isAuth, center.getCenterById)
api.post('/center/getCountCenterById', isAuth, center.getCountCenterById)
api.post('/center/editCenter',isAuth, center.editCenter)
api.post('/center/getCenters',isAuth, center.getCenters)
api.post('/center/findCenterById/:id',isAuth, center.findCenterById)
api.post('/center/getDataCenterToId', isAuth, center.getDataCenterToId)
api.post('/center/obtenerMultiplesCentros', isAuth, center.obtenerMultiplesCentros)
api.post('/center/consultaListaCentros', isAuth, center.consultaListaCentros)



//Center: role center
api.post('/center/findCentersById', isAuth, center.findCentersById)

//Users
api.post('/users/signUp', users.signUp)
api.post('/users/getUsers', users.getUsers)
api.post('/users/getUserById/:id', users.getUserById)
api.post('/users/upDateUser/:id', users.upDateUser)

api.post('/usuarios/obtenerUsuariosPorCentro', users.obtenerUsuariosPorCentro)
api.post('/usuarios/obtenerUsuariosPorCuenta', isAuth, users.obtenerUsuariosPorCuenta)
api.post('/usuarios/contarUsuarios', users.contarUsuarios)
api.post('/usuarios/obtenerUsuarioPorMarca', users.obtenerUsuarioPorMarca)




//Chart
api.post('/chart/workOrdersResume', chart.workOrdersResume)
api.post('/chart/getOrderByAccount', chart.getOrderByAccount)



// Apartado WorkShop
api.post('/workshop/newOrder', 
    workshop.getProcessByListId, 
    workshop.getActivitiesByListId, 
    // workshop.findOrder,
    workshop.newOrder )
api.post('/workshop/getOrders', workshop.getOrders)
api.post('/workshop/countOrders', workshop.countOrders)
api.post('/workshop/getOrderById', workshop.getOrderById)
api.post('/workshop/getOrderByIdToCustomer/:id', workshop.getOrderByIdToCustomer)
api.post('/workshop/updateOrder', workshop.updateOrder)
api.post('/workshop/uploads', workshop.uploads )
api.post('/workshop/sendEmail', workshop.sendEmail)

api.post('/workshop/setActivityAnswer', workshop.setActivityAnswer)
api.post('/workshop/setActivityComment', workshop.setActivityComment)
api.post('/workshop/setActivityAny', workshop.setActivityAny)



//Listas de proceso
api.post('/process/createList', process.createList)
api.post('/process/getList', process.getList)
api.post('/process/getListById', process.getListById)
api.post('/process/editList', process.editList)
api.post('/process/deletList', process.deletList)


api.post('/process/createProcess', process.createProcess)
api.post('/process/getProcess', process.getProcess)
api.post('/process/deletProcess', process.deletProcess)
api.post('/process/editProcess', process.editProcess)


// Actividades
api.post('/activity/createActivity', activity.createActivity)
api.post('/activity/getActivityByList', activity.getActivityByList)
api.post('/activity/editActivity', activity.editActivity)
api.post('/activity/deletActivity', activity.deletActivity)
api.post('/activity/getActivityCountByProcess', activity.getActivityCountByProcess)

api.get('/activity/getActivityByListToOrder', activity.getActivityByListToOrder)

//SMS
api.post('/sms/sendSMS', sms.getDataAccount, sms.sendSMS)
api.post('/sms/createSMSTemplate', sms.createSMSTemplate)
api.post('/sms/getByAccountSMSTemplate', sms.getByAccountSMSTemplate)
api.post('/sms/updateSMSTemplate', sms.updateSMSTemplate)
api.post('/sms/deletSMSTemplate', sms.deletSMSTemplate)
api.post('/sms/updateOneSMSTemplate', sms.updateOneSMSTemplate)


//Orders Reports
api.post('/orderReport/getOrders', orderReport.getOrders)


module.exports = api
