<?php include('header.php');?>

<section class="heading-sec">
	<div class="container">
		<div class="row align-item-center">
			<div class="col-lg-6 col-md-6 col-sm-6">
				<div class="main-heading-dash">
					<img src="../assets/images/icons/home-assets/mydocuments.png">
					<h4>My Documents</h4>
				</div>
			</div>
			<div class="col-lg-6 col-md-6 col-sm-6">
				<div class="text-right">
					<a class="btn-common-new" href="set-up-code.php">Add New Document</a>
				</div>
			</div>
		</div>
	</div>
</section>


<section>
	<div class="container">
		<div class="row align-item-center">
			<div class="col-lg-12">
				<div class="custom-space-btw another-drop-down for-search-document align-items-end">
					<div class="for-select-existing-doc">
					    <div class="input-group">
							<div class="dropdown keep-inside-clicks-open">
								<h3 class="small-title">MyReflet ID</h3>
								<button class="dropdwn-btn" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								    All
								</button>
								<div class="dropdown-menu" aria-labelledby="dropdownMenuButton" x-placement="bottom-start">
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
					</div>
					<div class="custom-flex-row">
						<form class=" response-search"> 
		                     <div class="input-group search-address-book">
		                        <input type="text" class="form-control autocomplete" id="myInput" placeholder="Search" onkeypress="autoSearch(this);">
		                        <div class="input-group-append">
		                            <button class="btn btn-search" type="button"><img src="../assets/images/icons/search-black.png"></button>
		                        </div>
		                    </div>
	                  	</form>
                  	</div>
				</div>
				<div class="personal-info-heading">
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
				<div class="personal-info-box table-responsive another-table">
					<table class="table" id="myTable3">
						<thead>
					    	<tr> 
						      	<th scope="col">Name/Type</th>
						      	<th scope="col">Send To</th>
						      	<th scope="col">Expiry Date</th>
						      	<th scope="col">Certified</th>
						      	<th scope="col">Self Certified</th>
						      	<th scope="col">Creation Date</th>
						      	<th scope="col">Action</th>
					    	</tr>
					  	</thead>
						<tbody>
						    <tr>
						    	<td>Driving License</td>
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
							    <td>1 July, 2020</td>
							    <td>Yes</td>
							    <td>Yes</td>
							    <td>30 jan, 2020</td>
							    <td>
							      	<a href="my-doc-license.php" class="view-link">View</a>
						      	</td>
						     </tr>
						     <tr>
						    	<td>Driving License</td>
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
							    <td>1 July, 2020</td>
							    <td>Yes</td>
							    <td>Yes</td>
							    <td>30 jan, 2020</td>
							    <td>
							      	<a href="my-doc-license.php" class="view-link">View</a>
						      	</td>
						     </tr>
						     <tr>
						    	<td>Driving License</td>
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
							    <td>1 July, 2020</td>
							    <td>Yes</td>
							    <td>Yes</td>
							    <td>30 jan, 2020</td>
							    <td>
							      	<a href="my-doc-license.php" class="view-link">View</a>
						      	</td>
						     </tr>
						     <tr>
						    	<td>Driving License</td>
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
							    <td>1 July, 2020</td>
							    <td>Yes</td>
							    <td>Yes</td>
							    <td>30 jan, 2020</td>
							    <td>
							      	<a href="my-doc-license.php" class="view-link">View</a>
						      	</td>
						     </tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</section>

<?php include('footer.php');?>
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.20/css/jquery.dataTables.css">
<script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.10.20/js/jquery.dataTables.js"></script>
<script>
$(document).ready( function () {
	$('.table').DataTable();
} );
</script>
<script>
	$(document).on('click.bs.dropdown.data-api', '.dropdown.keep-inside-clicks-open', function (e) {
	  e.stopPropagation();
	});
</script> 