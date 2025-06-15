<?php ?>

<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Document</title>

    <link rel="stylesheet" href="css/death.css">
</head>
<body>

<h1 class="heading">You died</h1>

<div id="imgWrap">
    <!--<img src="images/angel.png" alt="" id="visitorImg">-->
</div>

<script>

    document.addEventListener("DOMContentLoaded", () => {
        const cookieValue = document.cookie
            .split("; ")
            .find((row) => row.startsWith("visitor="))
            ?.split("=")[1];

        const visitorImg = new Image();
        visitorImg.src = `images/${cookieValue}.png`;

        document.getElementById("imgWrap").appendChild(visitorImg);
    });
</script>

</body>
</html>
