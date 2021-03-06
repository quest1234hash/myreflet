<!DOCTYPE html>
<html>
<head>
     <title>My Reflet Verifier</title>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=1.0, minimum-scale=1.0, maximum-scale=1.0">
    <!-- Favicon -->
    <link rel="icon" type="image/png" href="../assets/images/favicon.png">
  <!-- Bootstrap Core CSS -->
    <link href="../assets/css/bootstrap.min.css" rel="stylesheet"/>
    <link href="../assets/css/bootstrap-dropdownhover.min.css" rel="stylesheet"/>
  <!-- Animate CSS -->
    <link href="../assets/css/animate.css" rel="stylesheet"/>
    <!-- hover-min CSS -->
    <link href="../assets/css/hover-min.css" rel="stylesheet"/>
    <!-- yamm css -->
    <link href="../assets/css/yamm.css" rel="stylesheet"/>
    <!-- Font-awesome web fonts with css -->
    <link href="../assets/css/fontawesome-all.css" rel="stylesheet" type="text/css"/>
    <!-- Font-awesome web fonts with css -->
    <!-- loader css -->
    <link href="../assets/css/loader.css" rel="stylesheet"/>
    <!-- slick CSS -->
    <link href="../assets/css/slick.css" rel="stylesheet"/>
    <link href="../assets/css/slick-theme.css" rel="stylesheet"/>
    <!-- Custom CSS -->
    <link href="../assets/css/custom.css" rel="stylesheet"/>
    <link href="../assets/css/custom-new.css" rel="stylesheet"/>

    <link href="https://fonts.googleapis.com/css?family=Work+Sans:200,300,400,500,600,700,800,900&display=swap" rel="stylesheet">

     <link rel="stylesheet" href="../assets/css/jquery-ui.css">

    <!-- HTML5 Shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
    <!--[if lt IE 9]>
        <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
        <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
</head>
<body>


<div id="warpper" class="side-menu">
<!-- Header html -->

<!-- Header html end -->


<div id="mySidenav" class="sidenav">
   <div class="media nav-profile">
      <img class="align-self-center" src="../assets/images/other/face1.jpg">
      <div class="media-body align-self-center">
        <h5 class="mt-0">John</h5>
        <p>john@gmail.com</p>
      </div>
    </div>
   <ul class="aside-wrapper">
        <li>
            <a href="../dashboard-verifier/dashboard.php"  class="active">
              <img src="../assets/images/icons/home-assets/dashboard.png" class="white-img" alt="Wallet">
              <img src="../assets/images/icons/home-assets/dashbord-grey.png" class="black-icon" alt="Wallet">
              Dashboard
            </a>
        </li>
        <li>
            <a href="javascript:void(0)">
               <img src="../assets/images/icons/home-assets/myrefletID-purple.png" class="white-img" alt="Wallet">
               <img src="../assets/images/icons/home-assets/myrefletID.png" class="black-icon" alt="Wallet">
                MyReflet ID Code
            </a>
            <ul class="cus-sub-menu">
                <li><a href="../my-reflet-id-verifier/manage-categeory.php">Manage Categories</a></li>
                <li><a href="../my-reflet-id-verifier/manage-documents.php">Manage Documents</a></li>
                <li><a href="../my-reflet-id-verifier/my-reflet-id-code.php">View MyReflet ID</a></li>
            </ul>
        </li>
        <li>
            <a href="javascript:void(0)" >
               <img src="../assets/images/icons/verifier-home-assets/manage-sub-verifiers-purple.png" class="white-img" alt="Wallet">
               <img src="../assets/images/icons/verifier-home-assets/manage-sub-verifiers.png" class="black-icon" alt="Wallet">
              Sub Verifier
            </a>
            <ul class="cus-sub-menu">
                <li><a href="../sub-verifier/manage-sub-verifier.php">Manage Sub-Verifiers</a></li>
                <li><a href="../sub-verifier/manage-default-doc.php">Manage Default Documents Requested</a></li>
            </ul>
        </li>
        <li>
            <a href="../wallet -verifier/wallet-page.php" >
              <img src="../assets/images/icons/home-assets/wallet-purple.png" class="white-img" alt="Wallet">
              <img src="../assets/images/icons/home-assets/wallet.png" class="black-icon" alt="Wallet">
              Wallet
            </a>
        </li>
        <li>
            <a href="../my-clients/my-clients.php" >
              <img src="../assets/images/icons/home-assets/verifiers-purple.png" class="white-img" alt="Wallet">
              <img src="../assets/images/icons/home-assets/verifiers.png" class="black-icon" alt="Wallet">
              My Clients
            </a>
        </li>
        <li>
            <a href="../user-on-boarding-request/boarding-request.php" >
              <img src="../assets/images/icons/verifier-home-assets/user-on-boarding-requests-purple.png" class="white-img" alt="Wallet">
              <img src="../assets/images/icons/verifier-home-assets/user-on-boarding-requests.png" class="black-icon" alt="Wallet">
              User On-boarding Request
            </a>
        </li>
        <li>
            <a href="../complaints-verifier/complaints-list.php" >
              <img src="../assets/images/icons/home-assets/complaints-purple.png" class="white-img" alt="Wallet">
              <img src="../assets/images/icons/home-assets/complaints.png" class="black-icon" alt="Wallet">
              Complaints
            </a>
        </li>
        <li>
            <a href="../payment-history/payment-history-page.php" >
              <img src="../assets/images/icons/verifier-home-assets/user-on-boarding-requests-purple.png" class="white-img" alt="Wallet">
              <img src="../assets/images/icons/verifier-home-assets/user-on-boarding-requests.png" class="black-icon" alt="Wallet">
              Payment History
            </a>
        </li>
        <li>
            <a href="../my-reports/my-reports-list.php" >
              <img src="../assets/images/icons/verifier-home-assets/user-on-boarding-requests-purple.png" class="white-img" alt="Wallet">
              <img src="../assets/images/icons/verifier-home-assets/user-on-boarding-requests.png" class="black-icon" alt="Wallet">
              My Reports
            </a>
        </li>
    </ul>
</div>
<div id="main">
  <header class="header-main dashboard-header" id="dash-head">
    <div class="upper-strip">
      MyReflet : Client View
    </div>
    <div class="container-fluid">
        <nav class="navbar navbar-expand-lg navbar-light">
            <a class="navbar-brand" href="dashboard.php"><img src="../assets/images/logo-white.png" align="horse chain logo"></a>
             <a class="nav-link menu-toggler for-desktop" href="javascript:void(0);"><span id="menuToggle" style="font-size:16px;cursor:pointer" >&#9776;</span></a>
             <form class="form-inline my-2 my-lg-0">
                      <div class="input-group search">
                          <input type="text" class="form-control autocomplete" id="myInput" placeholder="Search" onkeypress="autoSearch(this);">
                          <div class="input-group-append">
                              <button class="btn btn-search" type="button"><img src="../assets/images/icons/search.png"></button>
                          </div>
                      </div>
                  </form>

               <ul class="navbar-nav ml-auto">
                    <li class="nav-item switch-option">
                       <div class="inner-div">
                         <span class="text">Switch to Client View </span>
                          <label class="switch">
                            <input type="checkbox">
                            <span class="slider round"></span>
                          </label>
                       </div>
                    </li>
                    <li class="nav-item dropdown notification-icon">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <img src="../assets/images/icons/bell.png" alt="notify">
                        <span class="badge">9</span>
                        </a>
                       <ul class="dropdown-menu dropdown-menu-media dropdown-menu-right">
                          <li class="dropdown-menu-header">
                            <h6 class="dropdown-header m-0"><span class="grey darken-2">Notifications</span><span class="notification-tag badge badge-default badge-danger float-right m-0">5 New</span></h6>
                          </li>
                            <li class="scrollable-container media-list w-100 ps-container ps-theme-dark">
                              <a href="javascript:void(0)">
                                <div class="media">
                                  <div class="media-left align-self-center">
                                     <img src="../assets/images/other/face1.jpg">
                                  </div>
                                  <div class="media-body">
                                    <p class="notification-text">Congrats! <b>Jack</b> has verified your passport.</p>
                                  </div>
                                   <div class="media-right">
                                    <small>
                                      <time class="media-meta text-muted">1 min ago</time></small>
                                   </div>
                                </div>
                               </a>
                                <a href="javascript:void(0)">
                                <div class="media">
                                  <div class="media-left align-self-center">
                                     <img src="../assets/images/other/face1.jpg">
                                  </div>
                                  <div class="media-body">
                                    <p class="notification-text">Congrats! <b>Jack</b> has verified your passport.</p>
                                  </div>
                                   <div class="media-right">
                                    <small>
                                      <time class="media-meta text-muted">1 min ago</time></small>
                                   </div>
                                </div>
                               </a>
                              </li>
                             <li class="dropdown-menu-footer"><a class="dropdown-item read-mor-link text-muted text-center" href="all-notification.php">Read all notifications</a></li>
                        </ul>
                    </li>
                     <li class="nav-item dropdown user-dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <img src="../assets/images/other/face1.jpg" align="user">
                        <span>John </span>
                        <i class="fas fa-caret-down"></i>
                        </a>
                        <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                            <a class="dropdown-item" href=""><img src="../assets/images/icons/9.png"> Profile</a>
                            <a class="dropdown-item" href=""><img src="../assets/images/icons/10.png"> Change Password</a>
                            <a class="dropdown-item" href=""><img src="../assets/images/icons/10.png"> Change Pin</a>
                            <a class="dropdown-item" href=""><img src="../assets/images/icons/12.png"> Logout</a>
                        </div>
                    </li>

                    <li class="nav-item">
                       <a class="nav-link menu-toggler for-mobile" style="display: none;" href="javascript:void(0);"><span id="menuToggle1" style="font-size:16px;cursor:pointer;" >&#9776;</span></a>
                    </li>
                   
                </ul>
        </nav>
    </div>
</header>
 







        
      