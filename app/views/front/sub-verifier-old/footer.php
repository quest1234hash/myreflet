 </div>

</div><!--  wrapper close -->


  <!-- JQuery -->
        <script type="text/javascript" src="../assets/js/poper.js"></script>
        <script type="text/javascript" src="../assets/js/jquery-3.3.1.min.js"></script>
        <!-- <script type="text/javascript" src="../assets/js/jquery-1.11.3.min.js"></script> -->
        <!-- Bootstrap Core JavaScript -->
        <script type="text/javascript" src="../assets/js/bootstrap.min.js"></script>

        <!-- dropdownhover effects JavaScript -->
        <script type="text/javascript" src="../assets/js/bootstrap-dropdownhover.min.js"></script>
        <!-- wow JavaScript -->
        <script type="text/javascript" src="../assets/js/wow.min.js"></script>
        <!-- video player JavaScript -->

        <script type="text/javascript" src="../assets/js/jquery-ui.js"></script>

        <!-- Custom JavaScript -->
        <script type="text/javascript" src="../assets/js/custom.js"></script>

        <script>
            $(document).ready(function(){
                $('#menuToggle').click(function(){
                    $("#warpper").toggleClass("side-menu");
                });
                $('#menuToggle1').click(function(){
                    $("#warpper").toggleClass("mobile-menu");
                });
            });
        </script>
        <script>
            $(document).ready(function(){
                $('.aside-wrapper > li > a').click(function(){
                    if($(this).hasClass("on")){
                        $(this).parent("li").find(".cus-sub-menu").slideUp(300);
                        $('.aside-wrapper > li > a').removeClass("on");
                    }
                    else{
                        $('.cus-sub-menu').slideUp(300);
                        $(this).parent("li").find(".cus-sub-menu").slideDown(300);
                        $('.aside-wrapper > li > a').removeClass("on");
                        $(this).addClass("on");
                    }
                });
            });
        </script>

    </body>
</html>
