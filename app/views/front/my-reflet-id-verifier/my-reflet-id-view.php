<?php include('header.php');?>


<section class="id-code-box-sec">
	<div class="container">
		<div class="row">
			<div class="col-xl-12 col-lg-12 col-md-12 col-sm-12">
				<div class="personal-info-heading">
					<div class="row align-item-center">
						<div class="col-md-8">
							<h4 class="purple-heading">Personal Information</h4>
						</div>
						<div class="col-md-4">
							<div class="text-right">
								<a href="">
									<div class="icon-for-dwnload">
										<div class="tooltip fade" data-title="Export Data">
											<img src="../assets/images/icons/dashboard-assets/export.png">
									     	<img class="info-icon" src="../assets/images/icons/dashboard-assets/info-icon.png">
										</div>
										
									</div>
								</a>
								<a href="">
									<div class="icon-for-dwnload">
										<div class="tooltip fade" data-title="Print Data">
											<img src="../assets/images/icons/dashboard-assets/print.png">
										    <img class="info-icon" src="../assets/images/icons/dashboard-assets/info-icon.png">
										</div>
									</div>
								</a>
							</div>
						</div>
					</div>
				</div>

				<div class="personal-info-box table-responsive">
					<table class="table" id="myTable">
					  <thead>
					    <tr>
					      <th scope="col">Label</th>
					      <th scope="col">Content</th>
					      <th scope="col">Create Date</th>
					      <th scope="col">Action</th>
					    </tr>
					  </thead>
					  <tbody>
					    <tr>
					      <th scope="row">
					      	<div class="for-flex-align">
					      		<img src="../assets/images/icons/createidentity-assets/user.png">
					      		First Name
					      	</div>
					      </th>
					      <td>John</td>
					      <td>jun 28, 2020</td>
					      <td>
					      	<div>
					      		<a href="" data-toggle="modal" data-target="#first-name-Modal">
					      			<img src="../assets/images/icons/dashboard-assets/edit.png">
					      		</a>
					      	</div>
					      </td>
					    </tr>
					     <tr>
					      <th scope="row">
					      	<div class="for-flex-align">
					      		<img src="../assets/images/icons/createidentity-assets/user.png">
					      		Middle Name
					      	</div>
					      </th>
					      <td>-</td>
					      <td>jun 28, 2020</td>
					      <td>
					      	<div>
					      		<a href="" data-toggle="modal" data-target="#middle-name-Modal">
					      		  <img src="../assets/images/icons/dashboard-assets/edit.png">
					      		</a>
					      	</div>
					      </td>
					    </tr>
					     <tr>
					      <th scope="row">
					      	<div class="for-flex-align">
					      		<img src="../assets/images/icons/createidentity-assets/user.png">
					      		Last Name
					      	</div>
					      </th>
					      <td>Doe</td>
					      <td>jun 28, 2020</td>
					      <td>
					      	<div>
					      		<a href="" data-toggle="modal" data-target="#last-name-Modal">
					      		  <img src="../assets/images/icons/dashboard-assets/edit.png">
					      		</a>
					      	</div>
					      </td>
					    </tr>
					     <tr>
					      <th scope="row">
					      	<div class="for-flex-align">
					      		<img src="../assets/images/icons/dashboard-assets/country.png">
					      		Country
					      	</div>
					      </th>
					      <td>Japan</td>
					      <td>jun 28, 2020</td>
					      <td>
					      	<div>
					      		<a href="" data-toggle="modal" data-target="#country-name-Modal">
					      		  <img src="../assets/images/icons/dashboard-assets/edit.png">
					      		</a>
					      	</div>
					      </td>
					    </tr>
					     <tr>
					      <th scope="row">
					      	<div class="for-flex-align">
					      		<img src="../assets/images/icons/dashboard-assets/verified-emailID.png">
					      		Email ID
					      	</div>
					      </th>
					      <td>johndoe@gmail.com</td>
					      <td>jun 28, 2020</td>
					      <td>
					      	<div>
					      		<a href="" data-toggle="modal" data-target="#email-id-Modal">
					      		  <img src="../assets/images/icons/dashboard-assets/edit.png">
					      		</a>
					      		<span class="tooltip fade" data-title="Your email is verified.">
					      			<img class="tooltip-inner-img" src="../assets/images/icons/dashboard-assets/verified.png" >
					      			<img class="info-icon" src="../assets/images/icons/dashboard-assets/info-icon.png">
					      		</span>
					      		
					      	</div>
					      </td>
					    </tr>
					      <tr>
					      <th scope="row">
					      	<div class="for-flex-align">
					      		<img src="../assets/images/icons/dashboard-assets/phone.png">
					      		Phone Number
					      	</div>
					      </th>
					      <td>+81 6758697845</td>
					      <td>jun 28, 2020</td>
					       <td>
					      	<div>
					      		<a href="" data-toggle="modal" data-target="#phone-no-Modal">
					      		  <img src="../assets/images/icons/dashboard-assets/edit.png">
					      		</a>
					      		<a href="" data-toggle="modal" data-target="#phone-not-verified-Modal">
						      		<span class="tooltip fade" data-title="Your phone number is not verified. Click here to verify.">
						      			<img class="tooltip-inner-img" src="../assets/images/icons/dashboard-assets/verificationpending.png" >
						      			<img class="info-icon" src="../assets/images/icons/dashboard-assets/info-icon.png">
						      		</span>
					      		</a>
					      		
					      		
					      	</div>
					      </td>
					    </tr>
					  </tbody>
					</table>
				</div>


				 <div class="personal-info-heading">
					<div class="row align-item-center">
						<div class="col-xl-7 col-lg-5 col-md-5">
							<h4 class="purple-heading">Additional Information</h4>
						</div>
						
						<div class="col-xl-5 col-lg-7 col-md-7">
							<div class="text-right">
								<a href="">
									<div class="icon-for-dwnload">
										<div class="tooltip fade" data-title="Export Data">
											<img src="../assets/images/icons/dashboard-assets/export.png">
									     	<img class="info-icon" src="../assets/images/icons/dashboard-assets/info-icon.png">
										</div>
										
									</div>
								</a>
								<a href="">
									<div class="icon-for-dwnload">
										<div class="tooltip fade" data-title="Print Data">
											<img src="../assets/images/icons/dashboard-assets/print.png">
										    <img class="info-icon" src="../assets/images/icons/dashboard-assets/info-icon.png">
										</div>
									</div>
								</a>
							</div>
						</div>
					</div>
				</div>

				<div class="personal-info-box table-responsive">
					<table class="table" id="myTable2">
					  <thead>
					    <tr>
					      <th scope="col">Label</th>
					      <th scope="col">Content</th>
					      <th scope="col">Create Date</th>
					      <th scope="col">Action</th>
					    </tr>
					  </thead>
					  <tbody>
					    <tr>
					      <th scope="row">
					      	<div class="for-flex-align">
					      		<img src="../assets/images/icons/dashboard-assets/address.png">
					      		Address 
					      	</div>
					      </th>
					      <td>98, ABC Street</td>
					      <td>jun 28, 2020</td>
					      <td>
					      	<div>
					      		<a href="" data-toggle="modal" data-target="#address-Modal">
					      		  <img src="../assets/images/icons/dashboard-assets/edit.png">
					      		</a>
					      	</div>
					      </td>
					    </tr>
					     <tr>
					      <th scope="row">
					      	<div class="for-flex-align">
					      		<img src="../assets/images/icons/dashboard-assets/BTCwalletaddress.png">
					      		BTC Wallet Address
					      	</div>
					      </th>
					      <td>-</td>
					      <td>12c15sd1bdf1bfg151b54f</td>
					      <td>
					      	<div>
					      		<a href="" data-toggle="modal" data-target="#btc-wallet-address-Modal">
					      		  <img src="../assets/images/icons/dashboard-assets/edit.png">
					      		</a>
					      	</div>
					      </td>
					    </tr>
					     <tr>
					      <th scope="row">
					      	<div class="for-flex-align">
					      		<img src="../assets/images/icons/dashboard-assets/company.png">
					      		Company Name
					      	</div>
					      </th>
					      <td>Quest Global Technologies</td>
					      <td>jun 28, 2020</td>
					      <td>
					      	<div>
					      		<a href="" data-toggle="modal" data-target="#company-name-Modal">
					      		  <img src="../assets/images/icons/dashboard-assets/edit.png">
					      		</a>
					      	</div>
					      </td>
					    </tr>
					     <tr>
					      <th scope="row">
					      	<div class="for-flex-align">
					      		<img src="../assets/images/icons/dashboard-assets/DOB.png">
					      		Date of Birth
					      	</div>
					      </th>
					      <td>January 20, 1992</td>
					      <td>jun 28, 2020</td>
					      <td>
					      	<div>
					      		<a href="" data-toggle="modal" data-target="#dob-Modal">
					      		  <img src="../assets/images/icons/dashboard-assets/edit.png">
					      		</a>
					      	</div>
					      </td>
					    </tr>
					     <tr>
					      <th scope="row">
					      	<div class="for-flex-align">
					      		<img src="../assets/images/icons/dashboard-assets/ETHwallet.png">
					      		ETH Wallet Address
					      	</div>
					      </th>
					      <td>1456411v2df1n54v231b</td>
					      <td>jun 28, 2020</td>
					      <td>
					      	<div>
					      		<a href="" data-toggle="modal" data-target="#eth-wallet-address-Modal">
					      		  <img src="../assets/images/icons/dashboard-assets/edit.png">
					      		</a>
					      	</div>
					      </td>
					    </tr>
					      <tr>
					      <th scope="row">
					      	<div class="for-flex-align">
					      		<img src="../assets/images/icons/dashboard-assets/nationality.png">
					      		Nationality
					      	</div>
					      </th>
					      <td>American</td>
					      <td>jun 28, 2020</td>
					      <td>
					      	<div>
					      		<a href="" data-toggle="modal" data-target="#nationality-Modal">
					      		  <img src="../assets/images/icons/dashboard-assets/edit.png">
					      		</a>
					      	</div>
					      </td>
					    </tr>
					  </tbody>
					</table>
				</div>
				<div class="personal-info-heading">
					<div class="row align-item-center">
						<div class="col-xl-7 col-lg-5 col-md-5">
							<h4 class="purple-heading">All Documents</h4>
						</div>
						<div class="col-xl-3 col-lg-4 col-md-4">
							<div>
								<a href="" class="btn-common-new btn-with-extra-padding">Add New Documents</a>
							</div>
						</div>
						<div class="col-xl-2 col-lg-3 col-md-3">
							<div class="text-right">
								<a href="">
									<div class="icon-for-dwnload">
										<div class="tooltip fade" data-title="Export Data">
											<img src="../assets/images/icons/dashboard-assets/export.png">
									     	<img class="info-icon" src="../assets/images/icons/dashboard-assets/info-icon.png">
										</div>
										
									</div>
								</a>
								<a href="">
									<div class="icon-for-dwnload">
										<div class="tooltip fade" data-title="Print Data">
											<img src="../assets/images/icons/dashboard-assets/print.png">
										    <img class="info-icon" src="../assets/images/icons/dashboard-assets/info-icon.png">
										</div>
									</div>
								</a>
							</div>
						</div>
					</div>
				</div>
				<div class="btn-all-dwnload">
					<a href=""><img src="../assets/images/icons/dashboard-assets/upload-purple.png"> Upload</a>
					<a href=""><img src="../assets/images/icons/dashboard-assets/download-purple.png"> Download</a>
					<a href=""><img src="../assets/images/icons/dashboard-assets/verified.png"> Verify</a>
				</div>
				
				<div class="tab-content" id="myTabContent">
				  <div class="tab-pane fade show active" id="doc-tab1" role="tabpanel" aria-labelledby="doc1">
				  	 <div class="personal-info-box table-responsive">
						<table class="table" id="myTable3">
						  <thead>
						    <tr>
						      <th scope="col">Label</th>
						      <th scope="col">Content</th>
						      <th scope="col">ID Number</th>
						      <th scope="col">Expiry Date</th>
						      <th scope="col">Create Date</th>
						      <th scope="col">Action</th>
						    </tr>
						  </thead>
						  <tbody>
						    <tr>
						      <th scope="row">
						      	<div class="for-flex-align">
						      		 <div class="checkbox">
							          <label>
							            <input type="checkbox" value="">
							            <span class="cr"><i class="cr-icon fa fa-check"></i></span>
							            <img src="../assets/images/icons/dashboard-assets/drivinglicense.png">
						      		     Driving License 
							          </label>
							        </div>
									
						      	</div>
						      </th>
						      <td>
						      	<div class="doc-img">
						      		<img src="../assets/images/icons/dashboard-assets/doc.png">
						      	</div>
						      </td>
						      <td>122054563123</td>
						      <td>jun 28, 2025</td>
						      <td>jun 28, 2020</td>
						      <td>
						      	<!-- <div class="doc-img">
						      		<img src="../assets/images/icons/dashboard-assets/menu.png">
						      	</div> -->
						      	<div class="dropdown-menu-new">
			                        <a class="nav-link dropdown-toggle" id="profileDropdown" href="#" data-toggle="dropdown" aria-expanded="false">
			                          <div class="doc-img">
								      		<img src="../assets/images/icons/dashboard-assets/menu.png">
								      	</div>
			                        </a>
			                        <div class="dropdown-menu" aria-labelledby="profileDropdown">
			                            <a class="dropdown-item" href="" data-toggle="modal" data-target="#upload-doc-Modal"><img src="../assets/images/icons/dashboard-assets/upload.png"> Upload</a>
										<a class="dropdown-item" href=""><img src="../assets/images/icons/dashboard-assets/download.png"> Download</a>
										<a class="dropdown-item" href="" data-toggle="modal" data-target="#set-docs-permission-Modal"><img src="../assets/images/icons/dashboard-assets/verified.png"> Verify</a>
			                        </div>
			                     </div>
						      </td>
						    </tr>
						    <tr>
						      <th scope="row">
						      	<div class="for-flex-align">
						      		 <div class="checkbox">
							          <label>
							            <input type="checkbox" value="">
							            <span class="cr"><i class="cr-icon fa fa-check"></i></span>
							            <img src="../assets/images/icons/dashboard-assets/utilitybill.png">
						      		     Utility Bill 
							          </label>
							        </div>
									
						      	</div>
						      </th>
						      <td>
						      	<div class="doc-img">
						      		<img src="../assets/images/icons/dashboard-assets/doc.png">
						      	</div>
						      </td>
						      <td>-</td>
						      <td>-</td>
						      <td>jun 28, 2020</td>
						      <td>
						      	<!-- <div class="doc-img">
						      		<img src="../assets/images/icons/dashboard-assets/menu.png">
						      	</div> -->
						      	<div class="dropdown-menu-new">
			                        <a class="nav-link dropdown-toggle" id="profileDropdown" href="#" data-toggle="dropdown" aria-expanded="false">
			                          <div class="doc-img">
								      		<img src="../assets/images/icons/dashboard-assets/menu.png">
								      	</div>
			                        </a>
			                        <div class="dropdown-menu" aria-labelledby="profileDropdown">
			                            <a class="dropdown-item" href="" data-toggle="modal" data-target="#upload-doc-Modal"><img src="../assets/images/icons/dashboard-assets/upload.png"> Upload</a>
										<a class="dropdown-item" href=""><img src="../assets/images/icons/dashboard-assets/download.png"> Download</a>
										<a class="dropdown-item" href="" data-toggle="modal" data-target="#set-docs-permission-Modal"><img src="../assets/images/icons/dashboard-assets/verified.png"> Verify</a>
			                        </div>
			                     </div>
						      </td>
						    </tr>
						    <tr>
						      <th scope="row">
						      	<div class="for-flex-align">
						      		 <div class="checkbox">
							          <label>
							            <input type="checkbox" value="">
							            <span class="cr"><i class="cr-icon fa fa-check"></i></span>
							            <img src="../assets/images/icons/dashboard-assets/passport.png">
						      		     Passport
							          </label>
							        </div>
									
						      	</div>
						      </th>
						      <td>
						      	<div class="doc-img">
						      		<img src="../assets/images/icons/dashboard-assets/doc.png">
						      	</div>
						      </td>
						      <td>-</td>
						      <td>-</td>
						      <td>jun 28, 2020</td>
						      <td>
						      	<!-- <div class="doc-img">
						      		<img src="../assets/images/icons/dashboard-assets/menu.png">
						      	</div> -->
						      	<div class="dropdown-menu-new">
			                        <a class="nav-link dropdown-toggle" id="profileDropdown" href="#" data-toggle="dropdown" aria-expanded="false">
			                          <div class="doc-img">
								      		<img src="../assets/images/icons/dashboard-assets/menu.png">
								      	</div>
			                        </a>
			                        <div class="dropdown-menu" aria-labelledby="profileDropdown">
			                            <a class="dropdown-item" href="" data-toggle="modal" data-target="#upload-doc-Modal"><img src="../assets/images/icons/dashboard-assets/upload.png"> Upload</a>
										<a class="dropdown-item" href=""><img src="../assets/images/icons/dashboard-assets/download.png"> Download</a>
										<a class="dropdown-item" href="" data-toggle="modal" data-target="#set-docs-permission-Modal"><img src="../assets/images/icons/dashboard-assets/verified.png"> Verify</a>
			                        </div>
			                     </div>
						      </td>
						    </tr>
						    <tr>
						      <th scope="row">
						      	<div class="for-flex-align">
						      		 <div class="checkbox">
							          <label>
							            <input type="checkbox" value="">
							            <span class="cr"><i class="cr-icon fa fa-check"></i></span>
							            <img src="../assets/images/icons/dashboard-assets/photoID.png">
						      		     Photo Identification
							          </label>
							        </div>
									
						      	</div>
						      </th>
						      <td>
						      	-
						      </td>
						      <td>-</td>
						      <td>-</td>
						      <td>-</td>
						      <td>
						      	<!-- <div class="doc-img">
						      		<img src="../assets/images/icons/dashboard-assets/menu.png">
						      	</div> -->
						      	<div class="dropdown-menu-new">
			                        <a class="nav-link dropdown-toggle" id="profileDropdown" href="#" data-toggle="dropdown" aria-expanded="false">
			                          <div class="doc-img">
								      		<img src="../assets/images/icons/dashboard-assets/menu.png">
								      	</div>
			                        </a>
			                        <div class="dropdown-menu" aria-labelledby="profileDropdown">
			                            <a class="dropdown-item" href="" data-toggle="modal" data-target="#upload-doc-Modal"><img src="../assets/images/icons/dashboard-assets/upload.png"> Upload</a>
										<a class="dropdown-item" href=""><img src="../assets/images/icons/dashboard-assets/download.png"> Download</a>
										<a class="dropdown-item" href="" data-toggle="modal" data-target="#set-docs-permission-Modal"><img src="../assets/images/icons/dashboard-assets/verified.png"> Verify</a>
			                        </div>
			                     </div>
						      </td>
						    </tr>

						    
						  </tbody>
						</table>
					 </div>
				  </div>
				</div>
			</div>			
		</div>
	</div>
</section>

<!-- Modal -->
<div class="modal fade field-edit-modal" id="upload-doc-Modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-body">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        <div class="create-wallet-box">
			<div class="row align-item-center">
				<div class="col-xl-2 col-lg-3 col-md-3">
					<div>
						<img src="../assets/images/icons/createidentity-assets/popup-upload-icon.png">
					</div>
				</div>
				<div class="col-xl-7 col-lg-7 col-md-7">
					<h5 class="heading-purple">Upload Document</h5>
				</div>
			</div>
			<div class="row">
				<div class="col-xl-12 col-lg-12 col-md-12 m-auto">
					<div class="setup-inner-box for-protact">
						<div class="create-rflet-id-form">
						    <div class="form-group browse-file-section">
				                  <input type="file" name="staff_image" class="file" style="visibility: hidden;position: absolute;" accept="image/x-png,image/jpeg">
				                  <div class="input-group col-xs-12">
				                    <span class="input-group-btn">
				                      <button class="browse btn btn-primary input-lg" type="button"> Choose a file</button>
				                    </span>
				                    <input type="text" class="form-control" readonly="" placeholder="">
				                  </div>
                              </div>
						    <div class="form-group">
								<div class="input-group">
								  <input type="text" id="datepicker1" class="form-control" placeholder="Expiry Date">
								</div>
							</div>
							<div class="form-group">
								<div class="input-group">
								  <input type="text" class="form-control" placeholder="Driving License Number">
								</div>
							</div>
						</div>
						<div >
							<a class="btn-common-new" href="">Upload</a>
							<a class="btn-common-new" href="">Cancel</a>
						</div>
					</div>
				</div>
			 </div>
	 	  </div>
       </div>
    </div>
  </div>
</div>

<?php include('footer.php');?>

<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.20/css/jquery.dataTables.css">
<script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.js"></script>
<script>
	$(document).ready( function () {
    $('#myTable').DataTable();
} );
	$(document).ready( function () {
    $('#myTable2').DataTable();
} );
		$(document).ready( function () {
    $('#myTable3').DataTable();
} );
			$(document).ready( function () {
    $('#myTable4').DataTable();
} );
				$(document).ready( function () {
    $('#myTable5').DataTable();
} );
</script>
        <script>
    $('.digit-group').find('input').each(function() {
    $(this).attr('maxlength', 1);
    $(this).on('keyup', function(e) {
        var parent = $($(this).parent());
        
        if(e.keyCode === 8 || e.keyCode === 37) {
            var prev = parent.find('input#' + $(this).data('previous'));
            
            if(prev.length) {
                $(prev).select();
            }
        } else if((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 65 && e.keyCode <= 90) || (e.keyCode >= 96 && e.keyCode <= 105) || e.keyCode === 39) {
            var next = parent.find('input#' + $(this).data('next'));
            
            if(next.length) {
                $(next).select();
            } else {
                if(parent.data('autosubmit')) {
                    parent.submit();
                }
            }
        }
    });
});
</script>

<script>
	 $(document).on('click', '.browse', function(){
    var file = $(this).parent().parent().parent().find('.file');
    file.trigger('click');
  });
  $(document).on('change', '.file', function(){
    $(this).parent().find('.form-control').val($(this).val().replace(/C:\\fakepath\\/i,''));
  }); 
</script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/signature_pad/1.5.3/signature_pad.min.js"></script>
 <script>
 	jQuery(document).ready(function($){
    
    var canvas = document.getElementById("signature");
    var signaturePad = new SignaturePad(canvas);
    
    $('#clear-signature').on('click', function(){
        signaturePad.clear();
    });
    
});
 </script>

 <script type="text/javascript">
   $(document).on('click', '.menu-for-id a', function() {
       $('.dropbtn').html($(this).html());  
   });
</script>


<script>
	$(document).on('click.bs.dropdown.data-api', '.dropdown.keep-inside-clicks-open', function (e) {
	  e.stopPropagation();
	});
</script>



 <script>
    $("#datepicker").datepicker();
    $("#datepicker1").datepicker();
 </script>