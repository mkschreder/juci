<!DOCTYPE html>
<html>
	<head>
		<title>JUCI WebGUI Documentation Manual</title>
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<link href="css/bootstrap.min.css" rel="stylesheet" media="screen">
	</head>
	<body>
		<nav class="navbar navbar-inverse navbar-fixed-top">
			<div class="container-fluid">
				<div class="navbar-header">
					<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
						<span class="sr-only">Toggle navigation</span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
					</button>
					<a class="navbar-brand" href="juci.html">JUCI Docs</a>
				</div>
				<div id="navbar" class="navbar-collapse collapse">
					<ul class="nav navbar-nav navbar-right">
					</ul>
					<!--<form class="navbar-form navbar-right">
						<input type="text" class="form-control" placeholder="Search...">
					</form>-->
				</div>
			</div>
		</nav>
		<div class="container-fluid" style="padding-top: 60px;">
			<div class="row">
				<div class="col-md-2 sidebar">
					<ul class="nav nav-sidebar">
						<li><a href="juci.html">Overview</a></li>
					</ul>
				</div>
				<div class="col-md-10 main">
					%CONTENT%
				</div>
			</div>
		</div>	
		<script src="http://code.jquery.com/jquery.js"></script>
		<script src="js/bootstrap.min.js"></script>
	</body>
</html>
