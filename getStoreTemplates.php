 <?php
$myfile = fopen("StoreTemplates.txt", "r") or die("Unable to open file!");
echo fread($myfile,filesize("StoreTemplates.txt"));
fclose($myfile);
?> 