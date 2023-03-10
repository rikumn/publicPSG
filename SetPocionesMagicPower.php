<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    //$dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    //$dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->beginTransaction();
    
    $_usuario = $_POST['usuario'];
    $_PurchasedPotions = explode(";", $_POST['PurchasedPotions']);
    
    $sth = $dbh->prepare('SELECT `ID` FROM `PotionSeller_db` WHERE `WalletAddress` = :usuario');
    $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
    $sth->execute();
    
    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();
    $output = "";

    echo count($_PurchasedPotions);
    if (count($result) > 0) //if (count($result) > 0 && count($_PurchasedPotions) > 0)
    {
        //VALUES '('.$_ID.', "'.$_tipo.'", '.$_poder.', "'.$_pos.'")');
        $_ID = $result[0]['ID'];
        $_potions = "";

        for($i = 0; $i < count($_PurchasedPotions); ++$i)
        {
            $_temporal = explode(",", $_PurchasedPotions[$i]);
            $_potions .= '('.$_ID.', "'.$_temporal[0].'", '.$_temporal[1].', '.$_temporal[2].', '.$_temporal[3].')';
            if($i < count($_PurchasedPotions) - 1) { $_potions .= ", "; }
        }
        
        //IDPociones IDUsuario TipoPocion Power Posicion Estado
        $sth = $dbh->prepare('INSERT INTO PocionesMagicPower (IDUsuario, TipoPocion, Power, Posicion, Tagged) VALUES '.$_potions);
        $sth->execute();
    }
    else
    {
        echo 'no se encontro el usuario!';
    }
    $dbh->commit();
}
catch(PDOException $e)
{
	echo "Error: " . $e->getMessage();
}
   
?>
