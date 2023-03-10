<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    //$dbh->beginTransaction();
    
    $_usuario = $_POST['usuario'];
    $_benefits = $_POST['data'];
    
    $sth = $dbh->prepare('UPDATE `PotionSeller_db` SET `BenefitSeq`='.$_benefits.' WHERE `WalletAddress` = '.$_usuario);    
    $sth->execute();
    
    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();
    if (count($result) >= 0 ) 
    {
        echo $result[0]['BenefitSeq'];
    }
    else
    {
        echo 'No hay permiso de comprar Ingredientes';
    }
    $dbh->commit();
}
catch(PDOException $e)
{
	echo "Error: " . $e->getMessage();
}
   
?>