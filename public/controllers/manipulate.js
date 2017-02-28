/* global $ */
$(document).ready(function() {
         $('#uploadForm').submit(function() {
            $("#status").empty().text("File is uploading...");
            $(this).ajaxSubmit({
                error: function(xhr) {
              status('Error: ' + xhr.status);
                },
                success: function(response) {
            console.log(response)
                $("#status").empty().text(response);
                
                }
            
        });
        return false;
        });
        
        // $('#uploadimg1').submit(function(e) {
        //     e.preventDefault();
        //     $("#status1").empty().text("File is uploading...");
        //     $(this).ajaxSubmit({
        //         error: function(xhr) {
        //       status('Error: ' + xhr.status);
        //         },
        //         success: function(response) {
        //     console.log(response)
        //         $("#status1").empty().text(response);
        //         $scope.editDisplay(id);
        //     }
            
        // });
        // return false;
        // });
        
        $('#uploadimg2').submit(function(e) {
            e.preventDefault();
            $("#status2").empty().text("File is uploading...");
            $(this).ajaxSubmit({
                error: function(xhr) {
              status('Error: ' + xhr.status);
                },
                success: function(response) {
            console.log(response)
                $("#status2").empty().text(response);
               
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
            console.log(response)
                $("#status3").empty().text(response);
               
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
            console.log(response)
                $("#status4").empty().text(response);
               
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
            console.log(response)
                $("#status5").empty().text(response);
               
                }
            
        });
        return false;
        });
        
      });
    