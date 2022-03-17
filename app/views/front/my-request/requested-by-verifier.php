<?php include('header.php');?>

<section class="heading-sec">
	<div class="container">
		<div class="row align-item-center">
			<div class="col-lg-12">
				<div class="main-heading-dash1">
					<h4 class="purple-heading">Requested by verifier Jack Ma</h4>
				</div>
				<div class="custom-space-btw another-drop-down m-top-30 align-items-end">
					<div class="for-select-existing-doc">
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
					</div>
					<div></div>
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
			</div>
			<div class="col-lg-12">
				<div class="personal-info-box table-responsive another-table">
					<table class="table" id="myTable3">
						<thead>
					    	<tr> 
						      	<th scope="col">Request ID</th>
						      	<th scope="col">MyReflet ID</th>
						      	<th scope="col">Requested On</th>
						      	<th scope="col">Due Date</th>
						      	<th scope="col">Status</th>
						      	<th scope="col">Action</th>
					    	</tr>
					  	</thead>
						<tbody>
						    <tr>
						    	<td>350052</td>
						      	<td><span class="font-w-600">John Doe </span> <br> 132556</td>
							    <td>20 jan, 2020</td>
							    <td>30 jan, 2020</td>
							    <td> <span class="accept-status">Pending</span></td>
							    <td>
							      	<a href="request-view.php" class="view-link">View</a>
						      	</td>
						    </tr>
						    <tr>
						    	<td>350052</td>
						      	<td><span class="font-w-600">John Doe </span> <br> 132556</td>
							    <td>20 jan, 2020</td>
							    <td>30 jan, 2020</td>
							    <td> <span class="accept-status">Pending</span></td>
							    <td>
							      	<a href="request-view.php" class="view-link">View</a>
						      	</td>
						    </tr>
						    <tr>
						    	<td>350052</td>
						      	<td><span class="font-w-600">John Doe </span> <br> 132556</td>
							    <td>20 jan, 2020</td>
							    <td>30 jan, 2020</td>
							    <td> <span class="accept-status">Pending</span></td>
							    <td>
							      	<a href="request-view.php" class="view-link">View</a>
						      	</td>
						    </tr>
						    <tr>
						    	<td>350052</td>
						      	<td><span class="font-w-600">John Doe </span> <br> 132556</td>
							    <td>20 jan, 2020</td>
							    <td>30 jan, 2020</td>
							    <td> <span class="accept-status">Pending</span></td>
							    <td>
							      	<a href="request-view.php" class="view-link">View</a>
						      	</td>
						    </tr>
						    <tr>
						    	<td>350052</td>
						      	<td><span class="font-w-600">John Doe </span> <br> 132556</td>
							    <td>20 jan, 2020</td>
							    <td>30 jan, 2020</td>
							    <td> <span class="accept-status">Pending</span></td>
							    <td>
							      	<a href="request-view.php" class="view-link">View</a>
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