/* global $ */
/*global angular*/

window.onload = function() {
    var isIE = /*@cc_on!@*/false || !!document.documentMode;
    if(isIE === true) {
        alert("Administrator says: FC-Online is not compatible with Internet Explorer, Please use Chrome");
	 window.location.replace("https://www.google.com/chrome/browser/desktop/index.html?brand=CHBD&gclid=CjwKEAiA8JbEBRCz2szzhqrx7H8SJAC6FjXXVihGM19_gII8U0SoiDzsUIaIRe2y2mi_BPBZGgpatRoC5dXw_wcB");
    }
}


var myApp = angular.module('myApp', []);
myApp.controller('AppCtrl', ['$scope', '$http', '$sce',
function($scope, $http, $sce){
    console.log("Adele says Hello");

    var sessionid;

    angular.element(window).on('keydown', function(e) {
        console.log(e);
    });

    $scope.toggleUpload = function(column) {
        var column;
        switch(column) {
            case 1:
                $('#uploadbar-1').toggle();
                break;
            case 2:
                $('#uploadbar-2').toggle();
                break;
            case 3:
                $('#uploadbar-3').toggle();
                break;
            case 4:
                $('#uploadbar-4').toggle();
                break;
            case 5:
                $('#uploadbar-5').toggle();
                break;
            case 6:
                $('#uploadbar-6').toggle();
                break;
            case 7:
                $('#uploadbar-7').toggle();
                break;
            case 8:
                $('#uploadbar-8').toggle();
                break;
            case 9:
                $('#uploadbar-9').toggle();
                break;
            case 10:
                $('#uploadbar-10').toggle();
                break;
            default:
                break;

        }

    }

    $scope.toggleAddBar = function() {
        $scope.item = "";
        $('#grayall').toggle();
        $('#add-screen').toggle();
        $('#exit-add-image').toggle();
        $('#pageheader').scrollTop(0);

    }

    $scope.rowVariantPlus = function() {
        $('#tablevariants > tbody:last-child').append('<tr><td><input type="text" name="size" autocomplete="off" required></td><td><input type="number" name="quantity" autocomplete="off" required></td><td><input type="text" name="upc" autocomplete="off" required></td></tr>');
    }

    $scope.rowVariantLess = function(){
        var table = document.getElementById('tablevariants');
        var rowCount = table.rows.length;
         table.deleteRow(rowCount - 1);
    }

    $scope.rowVariantPlusEdit = function() {
        $('#tablevariantsedit > tbody:last-child').append('<tr><td><input type="text" name="size" autocomplete="off"></td><td><input type="number" name="quantity" autocomplete="off"></td><td><input type="text" name="upc" autocomplete="off"></td></tr>');
    }

    $scope.rowVariantLessEdit = function(){
        var table = document.getElementById('tablevariantsedit');
        var rowCount = table.rows.length;
         table.deleteRow(rowCount - 1);
    }

    $scope.displayImage = function(image) {
        $('#image-display').show();
        $('#image-display-holder').attr('src', '/uploads/' + image);
        $('#grayall').show();
    }

    $scope.hideImage = function() {
        $('#image-display').hide();
        if ($('#edit-screen').is(':hidden')) {
            $('#grayall').hide();
        }

    }

    $scope.editDisplay = function(id) {
        $('#exit-edit-image').show();
        $('#grayall').show();

        $http.get('/items/' + id).success(function(response) {
            $('#edit-screen').show();
            $scope.item = response;
            //$scope.item.listdate = new Date($scope.item.listdate);

        });
        sessionid = id;
        console.log("testid: " + sessionid);


    }

    $scope.fullDisplay = function(id) {
        $('#grayall').show();
        $('#exit-image-full').show();
        $http.get('/items/' + id).success(function(response) {
            $('#full-display').show();
            $scope.item = response;
        });

    }

    $scope.exitDisplay = function(id) {
        $('#exit-image-full').hide();
        $('#grayall').hide();
        $('#full-display').hide();
        $scope.item = "";


    }

    $scope.refresh = function() {
    $http.get('/items').success(function(data){
        console.log("got the data");
        $scope.item = "";
        $scope.items = data;
        console.log("controller data:", data);
        $('#add-screen').hide();
        $('#grayall').hide();
        $('#edit-screen').hide();
        $('#image-display').hide();
        $('#uploadbar-1').hide();
        $('#uploadbar-2').hide();
        $('#uploadbar-3').hide();
        $('#uploadbar-4').hide();
        $('#uploadbar-5').hide();
        $('#uploadbar-6').hide();
        $('#uploadbar-7').hide();
        $('#uploadbar-8').hide();
        $('#uploadbar-9').hide();
        $('#uploadbar-10').hide();
        $('#full-display').hide();
        $('#exit-edit-image').hide();
        $('#exit-add-image').hide();
        $('#exit-image-full').hide();
    });
  };


    // $scope.update = function(id) {
    //     console.log($scope.item._id);
    //     $http.put('/api/photo/edit/' + $scope.item._id, $scope.item).success(function(response) {
    //         //refresh();
    //         //$('#edit-screen').hide();
    //         $('statusedit').empty().text(response);
    //         $scope.refresh();
    //     });

    //     };

    $(document).keyup(function(e) {
        if (e.keyCode == 27) {

            $('#add-screen').hide();
            $('#grayall').hide();
            $('#edit-screen').hide();
            //togglevalue = 1;
            $('#image-display').hide();
            $('#full-display').hide();
            $('#exit-edit-image').hide();
            $('#exit-add-image').hide();
            $('#exit-image-full').hide();
            $scope.refresh();
        }
    });

    $scope.exitForms = function() {
            document.getElementById("uploadForm").reset();
            $scope.item = " ";
            $('#add-screen').hide();
            $('#grayall').hide();
            $('#edit-screen').hide();
            //togglevalue = 1;
            $('#image-display').hide();
            $('#full-display').hide();
            $scope.refresh();

        }

    $scope.removeImg1= function(img, id) {
        var test = $scope.confirm();
        if(test == true) {
            $http.put('/items/imgs1/' + id);
            $http.delete('/uploads/' + img);
            $scope.editDisplay(id);
            //$scope.refresh();

        }
    }

    $scope.removeImg2= function(img, id) {
        var test = $scope.confirm();
        if (test == true) {
            $http.put('/items/imgs2/' + id);
            $http.delete('/uploads/' + img);
            $scope.editDisplay(id);

        }
    }

    $scope.removeImg3= function(img, id) {
        var test = $scope.confirm();
        if (test == true) {
            $http.put('/items/imgs3/' + id);
            $http.delete('/uploads/' + img);
            $scope.editDisplay(id);
        }
    }

    $scope.removeImg4= function(img, id) {
        var test = $scope.confirm();
        if (test == true) {
            $http.put('/items/imgs4/' + id);
            $http.delete('/uploads/' + img);
            $scope.editDisplay(id);
        }
    }

    $scope.removeImg5= function(img, id) {
        var test = $scope.confirm();
        if (test == true) {
            $http.put('/items/imgs5/' + id);
            $http.delete('/uploads/' + img);
            $scope.editDisplay(id);
        }
    }

    $scope.removeImg6= function(img, id) {
        var test = $scope.confirm();
        if (test == true) {
            $http.put('/items/imgs6/' + id);
            $http.delete('/uploads/' + img);
            $scope.editDisplay(id);
        }
    }

    $scope.removeImg7= function(img, id) {
        var test = $scope.confirm();
        if (test == true) {
            $http.put('/items/imgs7/' + id);
            $http.delete('/uploads/' + img);
            $scope.editDisplay(id);
        }
    }

    $scope.removeImg8= function(img, id) {
        var test = $scope.confirm();
        if (test == true) {
            $http.put('/items/imgs8/' + id);
            $http.delete('/uploads/' + img);
            $scope.editDisplay(id);
        }
    }

    $scope.removeImg9= function(img, id) {
        var test = $scope.confirm();
        if (test == true) {
            $http.put('/items/imgs9/' + id);
            $http.delete('/uploads/' + img);
            $scope.editDisplay(id);
        }
    }

    $scope.removeImg10= function(img, id) {
        var test = $scope.confirm();
        if (test == true) {
            $http.put('/items/imgs10/' + id);
            $http.delete('/uploads/' + img);
            $scope.editDisplay(id);
        }
    }



    $scope.confirm = function() {
        var test = confirm("Are you sure you want to delete?");
        if(test == true) {
            return true;
        } else {
            return false;
        }
    }


     $('#uploadimg1').submit(function(e) {
            e.preventDefault();
            $("#status1").empty().text("File is uploading...");
            $(this).ajaxSubmit({
                error: function(xhr) {
              status('Error: ' + xhr.status);
                },
                success: function(response) {
            console.log(response);
                $("#status1").empty().text(response);
                $scope.editDisplay(sessionid);
            }

        });
        return false;
        });

    $('#uploadimg2').submit(function(e) {
            e.preventDefault();
            $("#status2").empty().text("File is uploading...");
            $(this).ajaxSubmit({
                error: function(xhr) {
              status('Error: ' + xhr.status);
                },
                success: function(response) {
            console.log(response);
                $("#status2").empty().text(response);
                $scope.editDisplay(sessionid);
                }

        });
        return false;
        });

        $('#uploadimg3').submit(function(e) {
            e.preventDefault();
            $("#status3").empty().text("File is uploading...");
            $(this).ajaxSubmit({
                error: function(xhr) {
              status('Error: ' + xhr.status);
                },
                success: function(response) {
            console.log(response);
                $("#status3").empty().text(response);
                $scope.editDisplay(sessionid);
                }

        });
        return false;
        });

        $('#uploadimg4').submit(function(e) {
            e.preventDefault();
            $("#status4").empty().text("File is uploading...");
            $(this).ajaxSubmit({
                error: function(xhr) {
              status('Error: ' + xhr.status);
                },
                success: function(response) {
            console.log(response);
                $("#status4").empty().text(response);
                $scope.editDisplay(sessionid);
                }

        });
        return false;
        });

        $('#uploadimg5').submit(function(e) {
            e.preventDefault();
            $("#status5").empty().text("File is uploading...");
            $(this).ajaxSubmit({
                error: function(xhr) {
              status('Error: ' + xhr.status);
                },
                success: function(response) {
            console.log(response);
                $("#status5").empty().text(response);
                $scope.editDisplay(sessionid);
                }

        });
        return false;
        });

        $('#uploadimg6').submit(function(e) {
            e.preventDefault();
            $("#status6").empty().text("File is uploading...");
            $(this).ajaxSubmit({
                error: function(xhr) {
              status('Error: ' + xhr.status);
                },
                success: function(response) {
            console.log(response);
                $("#status6").empty().text(response);
                $scope.editDisplay(sessionid);
                }

        });
        return false;
        });

        $('#uploadimg7').submit(function(e) {
            e.preventDefault();
            $("#status7").empty().text("File is uploading...");
            $(this).ajaxSubmit({
                error: function(xhr) {
              status('Error: ' + xhr.status);
                },
                success: function(response) {
            console.log(response);
                $("#status7").empty().text(response);
                $scope.editDisplay(sessionid);
                }

        });
        return false;
        });

        $('#uploadimg8').submit(function(e) {
            e.preventDefault();
            $("#status8").empty().text("File is uploading...");
            $(this).ajaxSubmit({
                error: function(xhr) {
              status('Error: ' + xhr.status);
                },
                success: function(response) {
            console.log(response);
                $("#status8").empty().text(response);
                $scope.editDisplay(sessionid);
                }

        });
        return false;
        });

        $('#uploadimg9').submit(function(e) {
            e.preventDefault();
            $("#status9").empty().text("File is uploading...");
            $(this).ajaxSubmit({
                error: function(xhr) {
              status('Error: ' + xhr.status);
                },
                success: function(response) {
            console.log(response);
                $("#status9").empty().text(response);
                $scope.editDisplay(sessionid);
                }

        });
        return false;
        });

        $('#uploadimg10').submit(function(e) {
            e.preventDefault();
            $("#status10").empty().text("File is uploading...");
            $(this).ajaxSubmit({
                error: function(xhr) {
              status('Error: ' + xhr.status);
                },
                success: function(response) {
            console.log(response);
                $("#status10").empty().text(response);
                $scope.editDisplay(sessionid);
                }

        });
        return false;
        });

         $('#uploadForm').submit(function() {
            $("#status").empty().text("File is uploading...");
            $(this).ajaxSubmit({
                error: function(xhr) {
              status('Error: ' + xhr.status);
                },
                success: function(response) {
            console.log(response);
                $("#status").empty().text(response);
                $scope.item = "";
                document.getElementById('uploadForm').reset();
                $scope.refresh();
                }

        });
        return false;
        });

        $('#editForm').submit(function() {
            $("#statusedit").empty().text("File is updating...");
            $(this).ajaxSubmit({
                error: function(xhr) {
              status('Error: ' + xhr.status);
                },
                success: function(response) {
            console.log(response);
                $("#statusedit").empty().text(response);
                document.getElementById('editForm').reset();

                $scope.item = "";
                $scope.refresh();

                }

        });
        return false;
        });
}]);
