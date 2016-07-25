(function (angular) {
    'use strict';

    angular.module('taskInfoDirective', ['myAppConfig', 'notificationConfrimModule'])
        .controller('taskInfoController', ['$scope', '$http', 'ngDialog', 'SERVER_URL', 'USER',
            function ($scope, $http, ngDialog, serverUrl, user) {

                $scope.errors = [];

                $scope.closeTaskWin = function(){
                    $scope.closeThisDialog();
                };

                var isMlInUserDepartment = user.depId === $scope.ML.DepartmentId;
                var getTaskList = function() {
                    var apiString = '';

                    if (isMlInUserDepartment) {
                        apiString = '/api/Task/getDep';
                    }
                    else {
                        apiString = '/api/Task/getTasksForDep';
                    }

                    $http.get(serverUrl + apiString, {params: {numml: $scope.ML.NumML}})
                        .success(function (data) {
                            prepareDepartments(data);
                        })
                        .error(function (message) {
                            $scope.showErrorMessage(message);
                        });
                };
                if( !$scope.taskInfo.availableDepartments){
                    getTaskList();
                };
                /**
                 * Преобразование пришедших данных в формат таблицы Заданий
                 * @param data данные доступных заданиях
                 * */
                var prepareDepartments = function(data){
                    $scope.taskInfo.availableDepartments = [];
                    if(isMlInUserDepartment) {
                        angular.forEach(data, function (department) {
                            //Если не ГПЛР, то нормально. ГПЛР особенный

                            if (department.Id !== $scope.departamets.gplr) {
                                $scope.taskInfo.availableDepartments.push(departmentForm(department, department.Name, department.Task, 1));
                            }
                            else {
                                $scope.taskInfo.availableDepartments.push(departmentForm(department, department.Name + ' (привязка)', department.TaskGplrBind, 1));
                                $scope.taskInfo.availableDepartments.push(departmentForm(department, department.Name + ' (линия)', department.TaskGplrLine, 2));
                            }

                        });
                    }else{
                        if(!!data.Task && data.Task.length>0) {
                            if (data.Id !== $scope.departamets.gplr) {
                                $scope.taskInfo.availableDepartments.push(departmentForm(data, data.Name, data.Task, 1));
                            }
                            else {
                                if(data.TaskGplrBind.length>0) {
                                    $scope.taskInfo.availableDepartments.push(departmentForm(data, data.Name + ' (привязка)', data.TaskGplrBind, 1));
                                }
                                if(data.TaskGplrLine.length>0) {
                                    $scope.taskInfo.availableDepartments.push(departmentForm(data, data.Name + ' (линия)', data.TaskGplrLine, 2));
                                }
                            }
                        }
                    }
                };

                /**
                 *
                 * @param originalDepartment пришедший с сервера объект департамент
                 * @param newName имя задания в департмент (совпадает с департаментом, кроме ГПЛР)
                 * @param tasks {Array} список заданий
                 * @param taskType {Number} тип заданий
                 * @returns {{ExistB: *, Id: (*|Number), Name: *, Task: Array}} новый объект департамента, для отображения в таблице
                 */
                var departmentForm = function(originalDepartment,newName,tasks,taskType){
                    var newDepartment = {
                        ExistB: originalDepartment.ExistB,
                        Id: originalDepartment.Id,
                        Name: newName,
                        Task:[],
                    };
                    if(isMlInUserDepartment){
                        newDepartment.Task.push({
                            End:'A',
                            TypeAddress:1,
                            Type:taskType
                        }, {
                            End: 'B',
                            TypeAddress: 2,
                            Type: taskType
                        });
                    }
                    angular.forEach(tasks,function(task){
                        task.End = (task.TypeAddress === 1) ?'A':'B';
                        if(isMlInUserDepartment) {
                            newDepartment.Task[task.TypeAddress - 1]= task;
                        }else{
                            newDepartment.Task.push(task);
                        }
                    });
                    return newDepartment;
                };

                /**
                * Проверка, может ли данный пользователь выдать задание
                * @param {Number} stateId текущее состояние задания
                * @return {Boolean} может ли пользователь выдать задание
                * */
                $scope.CanSend = function(stateId){
                    return (!stateId) && isMlInUserDepartment;
                };
                /**
                 * Проверка, может ли данный пользователь отменить задание
                 * @param {Number} stateId текущее состояние задания
                 * @return {Boolean} может ли пользователь отменить задание
                 * */
                $scope.CanCancel= function(stateId){
                    return (stateId === $scope.TaskStates.Create) && isMlInUserDepartment;
                };
                /**
                 * Проверка, может ли данный пользователь принять задание
                 * @param {Number} stateId текущее состояние задания
                 * @return {Boolean} может ли пользователь принять задание
                 * */
                $scope.CanAccept = function(stateId){
                    return (stateId === $scope.TaskStates.Create) && !isMlInUserDepartment;
                };
                /**
                 * Проверка, может ли данный пользователь выполнить задание
                 * @param {Number} stateId текущее состояние задания
                 * @return {Boolean} может ли пользователь выполнить задание
                 * */
                $scope.CanClose = function(stateId){
                    return (stateId === $scope.TaskStates.Accepted) && !isMlInUserDepartment;
                };
                /**
                 * Проверка, может ли данный пользователь вернуть задание
                 * @param {Number} stateId текущее состояние задания
                 * @return {Boolean} может ли пользователь вернуть задание
                 * */
                $scope.CanReturn= function(stateId){
                    return ((stateId === $scope.TaskStates.Accepted) || (stateId === $scope.TaskStates.Create)) && !isMlInUserDepartment;
                };


                /**
                 * Функция отправки задания в департамент
                 * @param task шаблон задания. Берется из таблицы
                 * @param {Number} departmentId ID номер департамента, в который будет отправлено задание
                 */
                $scope.sendTask = function(task,departmentId){

                    $scope.ConfirmWindowMessage = 'Вы уверены, что хотите выдать задание?';
                    ngDialog.openConfirm({
                        template: serverUrl + '/app/routeSheets/taskIssue/confirmWindow.html',
                        className: 'ngdialog-theme-default',
                        width: '400px',
                        scope: this,
                        disableAnimation: true,
                        position: 50,
                        title: 'Выдать задание'
                    }).then(function(success) {
                        task.Description = success;
                        $scope.showGlobalMask();
                        $http.post(serverUrl + "/api/task/create", {
                                MlTasks: [{
                                    NumML: $scope.ML.NumML,
                                    DepartmentToId: departmentId,
                                    TypeAddress: task.TypeAddress,
                                    Type: task.Type,
                                    Description: task.Description
                                }]
                            })
                            .success(function (data) {
                                $scope.hideGlobalMask();
                                getTaskList();
                                updateHistory();
                               // $scope.socket.send('update');
                            })
                            .error(function (message) {
                                $scope.hideGlobalMask();
                                $scope.showError();
                            });
                    });
                };

                /**
                 * Функция отмена задания по его номеру
                 * @param {Number} taskId ID задания, которое требуется отменить
                 */
                $scope.cancelTask = function(taskId){
                    $scope.ConfirmWindowMessage = 'Вы уверены, что хотите отменить задание?';
                    ngDialog.openConfirm({
                        template: serverUrl + '/app/routeSheets/taskIssue/confirmWindow.html',
                        className: 'ngdialog-theme-default',
                        width: '400px',
                        scope: this,
                        disableAnimation: true,
                        position: 50,
                        title: 'Отменить задание'
                    }).then(function(success) {

                        $scope.showGlobalMask();

                        $http.put(serverUrl + "/api/task/cancel", {
                                MlTasks: [{
                                    NumML: $scope.ML.NumML,
                                    Id: taskId,
                                    Description:  success.Comment
                                }]
                            })
                            .success(function (data) {
                                $scope.hideGlobalMask();
                                getTaskList();
                                updateHistory();
                            })
                            .error(function (message) {
                                $scope.hideGlobalMask();
                                $scope.showError();
                            });
                    });
                };

                /**
                 * Функция принятия задания
                 * @param {Number} taskId ID задания, которое пользователь принимает
                 */
                $scope.acceptTask= function(taskId){
                    $scope.ConfirmWindowMessage = 'Вы уверены, что хотите принять задание?';
                    ngDialog.openConfirm({
                        template: serverUrl + '/app/routeSheets/taskIssue/confirmWindow.html',
                        className: 'ngdialog-theme-default',
                        width: '400px',
                        scope: this,
                        disableAnimation: true,
                        position: 50,
                        title: 'Принять задание'
                    }).then(function(success) {

                        $scope.showGlobalMask();

                        $http.put(serverUrl + "/api/task/accept", {
                                MlTasks: [{
                                    NumML: $scope.ML.NumML,
                                    Id: taskId,
                                    Description:  success.Comment
                                }]
                            })
                            .success(function (data) {
                                $scope.hideGlobalMask();
                                getTaskList();
                                updateHistory();
                            })
                            .error(function (message) {
                                $scope.hideGlobalMask();
                                $scope.showError();
                            });
                    });
                };

                /**
                 * Функция сдачи задания
                 * @param {Number} taskId ID задания, которое пользователь принимает
                 */
                $scope.closeTask= function(taskId){
                    $scope.ConfirmWindowMessage = 'Вы уверены, что хотите сдать задание?';
                    ngDialog.openConfirm({
                        template: serverUrl + '/app/routeSheets/taskIssue/confirmWindow.html',
                        className: 'ngdialog-theme-default',
                        width: '400px',
                        scope: this,
                        disableAnimation: true,
                        position: 50,
                        title: 'Сдать задание'
                    }).then(function(success) {

                        $scope.showGlobalMask();

                        $http.put(serverUrl + "/api/task/close", {
                                MlTasks: [{
                                    NumML: $scope.ML.NumML,
                                    Id: taskId,
                                    Description:  success.Comment
                                }]
                            })
                            .success(function (data) {
                                $scope.hideGlobalMask();
                                getTaskList();
                                updateHistory();
                            })
                            .error(function (message) {
                                $scope.hideGlobalMask();
                                $scope.showError();
                            });
                    });

                };

                /**
                 * Функция возврата задания
                 * @param {Number} taskId ID задания, которое пользователь хочет вернуть
                 */
                $scope.returnTask= function(taskId) {
                    $http.get(serverUrl + "/api/reason/return")
                        .success(function (data) {
                            $scope.reasons = data;
                        })
                        .error(function () {
                            $scope.showError();
                        });
                    $scope.ConfirmWindowMessage = 'Вы уверены, что хотите вернуть задание?';
                    ngDialog.openConfirm({
                        template: serverUrl + '/app/routeSheets/taskIssue/confirmWindow.html',
                        className: 'ngdialog-theme-default',
                        width: '400px',
                        scope: this,
                        disableAnimation: true,
                        position: 50,
                        title: 'Вернуть задание'
                    }).then(function(success) {

                           $scope.showGlobalMask();

                       $http.put(serverUrl + "/api/task/return", {
                                ReturnTasks: [{
                                    NumML: $scope.ML.NumML,
                                    Id: taskId,
                                    Description:  success.Comment
                                }],
                            ReasonId:success.Reason
                            })
                            .success(function (data) {
                                $scope.hideGlobalMask();
                                getTaskList();
                                updateHistory();
                            })
                            .error(function (message) {
                                $scope.hideGlobalMask();
                                $scope.showError();
                            });
                    });
                };
                /**
                 * Обновить историю заданий
                 * */
                var updateHistory = function () {
                    $http.get(serverUrl + '/api/Task/historyTaskMl', {
                            params: {
                                numml: $scope.ML.NumML
                            }
                        })
                        .success(function (data) {
                            $scope.taskInfo.taskHistory = data;
                        });
                };
                /**
                 * Задать высоту в 1 или 2 строки у поля Департамент.
                 * @param department - департамент, для которого определяется высота поля в таблице
                 */
                $scope.setRowSpan = function(department){
                    if(isMlInUserDepartment){
                        return department.ExistB + 1;
                    }else{
                        return department.Task.length;
                    }
                }

                /**
                 * Задать ширину в 2 или 3 колонки у поля Основание.
                 */
                $scope.setColSpan = function(){
                    if(isMlInUserDepartment) {
                        return 2;
                    }
                    else{
                        return 3;
                    }
                }
                /**
                 *
                 * @returns {boolean} является ли заданием для департамента.
                 */
                $scope.TaskForDepartment = function(){
                  return  !isMlInUserDepartment;
                };

            }])
        .directive('taskInfo', ['SERVER_URL', function (serverUrl) {
            return {
                restrict: 'E',
                templateUrl: serverUrl + '/app/routeSheets/taskIssue/info/view.html',
                scope: true,
            };
        }]);

})(window.angular);
