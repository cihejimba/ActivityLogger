'use strict';


angular.module('ActivityLogger')
    .controller('ProfileCtrl',
        function($scope, $ionicPopup, DataService, $timeout) {
            var user = DataService.getUserLocal();
            var userId = DataService.getStatus('userId');
            var firebaseConnected = DataService.getStatus('firebaseConection') == 'true';

            if (user) {
                if (userId && firebaseConnected) { //firebase Id
                    this.user = DataService.getUserByID(userId);
                } else {
                    this.user = user;
                }
            } else {
                this.user = {};
            }

            this.genders = ["Männlich", "Weiblich"];

            function valide(user) {
                var error = "";
                var leer = "   darf nicht leer sein <br>";
                var positif = "muss  > 0 sein <br>";
                var isvalide = true;

                if (!user.surname || user.surname.length == 0) {
                    error += "name" + leer;
                    isvalide = false;
                }
                if (!user.firstname || user.firstname.length == 0) {
                    error += "Vorname" + leer;
                    isvalide = false;
                }
                if (!user.birthday || user.birthday.length == 0) {
                    error += "Alt" + leer;
                    isvalide = false;
                }
                if (!user.weight || user.weight.length == 0) {
                    error += "Gewicht" + leer;
                    isvalide = false;
                }
                if (!user.size || user.size.length == 0) {
                    error += "Gewicht" + leer;
                    isvalide = false;
                }

                if (checkSize(user.size)) {
                    if (((parseInt(user.size) || parseFloat(user.size)) <= 0)) {
                        error += "Größe " + positif;
                        isvalide = false;
                    }

                } else {
                    error += "Größe " + positif;
                    isvalide = false;
                }

                if (checkWeight(user.weight)) {
                    if (((parseInt(user.weight) || parseFloat(user.weight)) <= 0)) {
                        error += " Gewicht" + positif;
                        isvalide = false;
                    }

                } else {
                    error += "Gewicht " + positif;
                    isvalide = false;
                }


                function checkSize(str) {
                    return /^[+]?[0-9]+(\.[0-9]+)?$/.test(str);
                }

                function checkWeight(str) {
                    return /^[+]?[0-9]+(\.[0-9]+)?$/.test(str);
                }

                return error;
            };

            function equal(user1, user2) {
                var isequal =
                    ((user1.surname == user2.surname) &&
                        (user1.firstname == user2.firstname) &&
                        (user1.gender == user2.gender) &&
                        (user1.birthday == user2.birthday) &&
                        (user1.weight == user2.weight) &&
                        (user1.size == user2.size));

                return isequal;
            }

            function bindWithfirebase(_user) {
                var users = DataService.getAllUsers();
                for (var i = 0; i <= users.length; i++) {
                    var user = users[i];
                    if (equal(user, _user)) {
                        thisCtl.user = DataService.getUserByID(user.$id);
                        DataService.setStatus('userId', user.$id); //Store usersid that was generated by firebase
                        break;
                    }
                }
                DataService.setStatus('bind', 'true');
            }

            var thisCtl = this;
            var isSave = false;

            this.save = function() {
                var error = valide(this.user);
                if (error == "") {
                    if (firebaseConnected) {

                        if (!DataService.getUserLocal()) {
                            //1.Add user to firebase
                            DataService.addUser(thisCtl.user);
                            //2.Bind user with firebase if not have been
                            var timer = false;
                            $scope.$watch(thisCtl.user, function() { //wait for connect to firebase
                                if (timer) {
                                    $timeout.cancel(timer)
                                }
                                timer = $timeout(function() {
                                    bindWithfirebase(thisCtl.user);
                                }, 4 * 60) //wait 4 seconds
                            });
                        } else {
                            DataService.updateUser(thisCtl.user);
                        }
                    } else {
                        if (!DataService.getUserLocal()) {
                            DataService.addUser(thisCtl.user);
                        } else {
                            DataService.updateUser(thisCtl.user);
                        }
                    }
                    isSave = true;

                } else {
                    if (error != "") {
                        $ionicPopup.alert({
                            title: ' Eingabefehler ',
                            template: error
                        });
                    }
                }
            };

            var thisCtrl = this;
            $scope.$on('$stateChangeStart',
                function(event) {
                    //TODO
                    /*if (!isSave) {
                   thisCtrl.save();
                }*/
                }
            );
        });