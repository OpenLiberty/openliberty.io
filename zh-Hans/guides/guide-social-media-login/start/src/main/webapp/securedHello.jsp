<%@ page contentType="text/html;charset=UTF-8"%>
<html>
<head>
    <title>Title</title>
</head>
<body>
<h1>Social Media Login Guide</h1>
<p>Welcome to the social media login guide</p>
<p>You are currently authenticated!</p>
<!-- tag::username[] -->
<p>Hello, ${username}</p>
<!-- end::username[] -->
<!-- tag::logout[] -->
<form method="post" action="logout">
    <!-- tag::logoutButton[] -->
    <button type="submit">Log out</button>
    <!-- end::logoutButton[] -->
</form>
<!-- end::logout[] -->
</body>
</html>
