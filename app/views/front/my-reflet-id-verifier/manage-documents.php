<?php include('header.php');?>


<section class="id-code-box-sec">
	<div class="container">
		<div class="row">
			<div class="col-xl-12 col-lg-12 col-md-12 col-sm-12">
				<div class="personal-info-heading">
					<div class="row align-item-center">
						<div class="col-xl-7 col-lg-5 col-md-5">
							<h4 class="purple-heading">Manage Documents</h4>
						</div>
						<div class="col-xl-3 col-lg-4 col-md-4">
							<div>
								<a href="" class="btn-common-new btn-with-extra-padding" data-target="#addDocument" data-toggle="modal">Add Documents</a>
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


				<div class="custom-space-btw another-drop-down m-top-30 align-items-end">
					<div class="for-select-existing-doc three-drop-custom align-items-end">
					    <!-- one section -->
						<div class="input-group">
							<div class="dropdown keep-inside-clicks-open">
								<h3 class="small-title">MyReflet ID</h3>
								<button class="dropdwn-btn" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								    All
								</button>
								<div class="dropdown-menu" aria-labelledby="dropdownMenuButton" x-placement="bottom-start" style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(0px, 20px, 0px);">
								    <div class="for-doc-select">
								    	<div class="checkbox"> 	
								        	<label>
								          		All
								            	<input type="checkbox" value="">
								            	<span class="cr"><i class="cr-icon fa fa-check"></i></span>
								          	</label>
								        </div>	
								    </div>
								    <div class="for-doc-select">
								    	<div class="checkbox"> 	
								         	<label>
									          	John Doe - 1235556
									            <input type="checkbox" value="">
									            <span class="cr"><i class="cr-icon fa fa-check"></i></span>
								          	</label>
								        </div>	
								    </div>
								    <div class="for-doc-select">
								    	<div class="checkbox"> 	
								         	<label>
									          	Quest Glt - 1235556
									            <input type="checkbox" value="">
									            <span class="cr"><i class="cr-icon fa fa-check"></i></span>
								          	</label>
								        </div>	
								    </div>
								</div>
							</div>
						</div>
						<!-- second section -->
						<div class="">
							<form class="response-search width-250"> 
			                     <div class="input-group search-address-book">
			                        <input type="text" class="form-control autocomplete" id="myInput" placeholder="Search" onkeypress="autoSearch(this);">
			                        <div class="input-group-append">
			                            <button class="btn btn-search" type="button"><img src="../assets/images/icons/search-black.png"></button>
			                        </div>
			                    </div>
		                  	</form>
						</div>
					</div>
					<div>
						<div class="btn-all-dwnload m-0">
							<a href=""><img src="../assets/images/icons/dashboard-assets/edit_per.png"> Edit</a>
							<a href=""><img src="../assets/images/icons/dashboard-assets/trash_per.png"> Delete</a>
						</div>
					</div>
				</div>
				
				<div class="tab-content m-top-40" id="myTabContent">
				  <div class="tab-pane fade show active" id="doc-tab1" role="tabpanel" aria-labelledby="doc1">
				  	 <div class="personal-info-box table-responsive">
						<table class="table" id="myTable3">
						  <thead>
						    <tr>
						      <th scope="col">Name</th>
						      <th scope="col">Document</th>
						      <th scope="col">Description</th>
						      <th scope="col">Create Date</th>
						      <th scope="col">Create By</th>
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
						      <td>Lorem ipsume</td>
						      <td>jun 28, 2025</td>
						      <td>
						      	<div class="for-flex-align">
						      		<div class="checkbox">
							          	<label>
								            <img class="profile-table" src="../assets/images/other/img_user1.png">
						      		     	<p class="line-hgt">
						      		     		<span class="font-w-600">Jack Ma</span> <br>
						      		     		25102
						      		     	</p>
							         	 </label>
							        </div>
								</div>
						      </td>
						      <td>
						      	<div class="dropdown-menu-new">
			                        <a class="nav-link dropdown-toggle" id="profileDropdown" href="#" data-toggle="dropdown" aria-expanded="false">
			                          <div class="doc-img">
								      		<img src="../assets/images/icons/dashboard-assets/menu.png">
								      	</div>
			                        </a>
			                        <div class="dropdown-menu" aria-labelledby="profileDropdown">
			                            <a class="dropdown-item" href="../my-reflet-id-verifier/edit-document.php"><img src="../assets/images/icons/dashboard-assets/edit.png"> Edit</a>
										<a class="dropdown-item" href=""><img src="../assets/images/icons/dashboard-assets/trash.png"> Delete</a>
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
							             Photo Identification
							          </label>
							        </div>
								</div>
						      </th>
						      <td>
						      	<div class="doc-img">
						      		<img src="../assets/images/icons/dashboard-assets/doc.png">
						      	</div>
						      </td>
						      <td>Lorem ipsume</td>
						      <td>jun 28, 2025</td>
						      <td>
						      	<div class="for-flex-align">
						      		<div class="checkbox">
							          	<label>
								            <img class="profile-table" src="../assets/images/other/img_user1.png">
						      		     	<p class="line-hgt">
						      		     		<span class="font-w-600">Jack Ma</span> <br>
						      		     		25102
						      		     	</p>
							         	 </label>
							        </div>
								</div>
						      </td>
						      <td>
						      	<div class="dropdown-menu-new">
			                        <a class="nav-link dropdown-toggle" id="profileDropdown" href="#" data-toggle="dropdown" aria-expanded="false">
			                          <div class="doc-img">
								      		<img src="../assets/images/icons/dashboard-assets/menu.png">
								      	</div>
			                        </a>
			                        <div class="dropdown-menu" aria-labelledby="profileDropdown">
			                            <a class="dropdown-item" href="../my-reflet-id-verifier/edit-document.php"><img src="../assets/images/icons/dashboard-assets/edit.png"> Edit</a>
										<a class="dropdown-item" href=""><img src="../assets/images/icons/dashboard-assets/trash.png"> Delete</a>
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
						      <td>Lorem ipsume</td>
						      <td>jun 28, 2025</td>
						      <td>
						      	<div class="for-flex-align">
						      		<div class="checkbox">
							          	<label>
								            <img class="profile-table" src="../assets/images/other/img_user1.png">
						      		     	<p class="line-hgt">
						      		     		<span class="font-w-600">Jack Ma</span> <br>
						      		     		25102
						      		     	</p>
							         	 </label>
							        </div>
								</div>
						      </td>
						      <td>
						      	<div class="dropdown-menu-new">
			                        <a class="nav-link dropdown-toggle" id="profileDropdown" href="#" data-toggle="dropdown" aria-expanded="false">
			                          <div class="doc-img">
								      		<img src="../assets/images/icons/dashboard-assets/menu.png">
								      	</div>
			                        </a>
			                        <div class="dropdown-menu" aria-labelledby="profileDropdown">
			                            <a class="dropdown-item" href="../my-reflet-id-verifier/edit-document.php"><img src="../assets/images/icons/dashboard-assets/edit.png"> Edit</a>
										<a class="dropdown-item" href=""><img src="../assets/images/icons/dashboard-assets/trash.png"> Delete</a>
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
						      <td>Lorem ipsume</td>
						      <td>jun 28, 2025</td>
						      <td>
						      	<div class="for-flex-align">
						      		<div class="checkbox">
							          	<label>
								            <img class="profile-table" src="../assets/images/other/img_user1.png">
						      		     	<p class="line-hgt">
						      		     		<span class="font-w-600">Jack Ma</span> <br>
						      		     		25102
						      		     	</p>
							         	 </label>
							        </div>
								</div>
						      </td>
						      <td>
						      	<div class="dropdown-menu-new">
			                        <a class="nav-link dropdown-toggle" id="profileDropdown" href="#" data-toggle="dropdown" aria-expanded="false">
			                          <div class="doc-img">
								      		<img src="../assets/images/icons/dashboard-assets/menu.png">
								      	</div>
			                        </a>
			                        <div class="dropdown-menu" aria-labelledby="profileDropdown">
			                            <a class="dropdown-item" href="../my-reflet-id-verifier/edit-document.php"><img src="../assets/images/icons/dashboard-assets/edit.png"> Edit</a>
										<a class="dropdown-item" href=""><img src="../assets/images/icons/dashboard-assets/trash.png"> Delete</a>
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


<!--Add Document Modal E -->
<?php include('footer.php');?>

<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.20/css/jquery.dataTables.css">
<script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.js"></script>
<script>
	$(document).ready( function () {
    	$('#myTable').DataTable();
	});
</script>
<script>
	$(document).on('click.bs.dropdown.data-api', '.dropdown.keep-inside-clicks-open', function (e) {
	  e.stopPropagation();
	});
</script>