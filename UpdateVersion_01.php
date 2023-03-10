<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    $dbh->beginTransaction();
    
    //$sth = $dbh->prepare('SELECT ID, SUBSTRING_INDEX(SUBSTRING_INDEX(Data, ";", -1), ";", 2) AS pociones FROM `PotionSeller_db` WHERE ID = 56 OR ID = 3 ORDER BY ID ASC');
    $sth = $dbh->prepare('SELECT ID, SUBSTRING_INDEX(SUBSTRING_INDEX(Data, ";", -1), ";", 2) AS pociones FROM `PotionSeller_db`');
    $sth->execute(); 
    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result_data = $sth->fetchAll();
    
    if (count($result_data) > 0){

        $sth = $dbh->prepare('SELECT * FROM `Phytoness`ORDER BY IDPhytoness ASC');   
        $sth->execute(); 
        $sth->setFetchMode(PDO::FETCH_ASSOC); 
        $result_Phytoness = $sth->fetchAll();

        //new Potion("Best Harvest",[[0,5],[1,2]],this ,"Great fertilizer.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","agriculture"),
        $_pocion1 = ($result_Phytoness[0]['Precio'] * 5) + ($result_Phytoness[1]['Precio'] * 2);
        //new Potion("Happy Cow", [[0,5],[3,2]],this,"More cows!","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "ganadery"),
        $_pocion2 = ($result_Phytoness[0]['Precio'] * 5) + ($result_Phytoness[3]['Precio'] * 2);
        //new Potion("Ache Shooer", [[1,5],[4,2]],this,"Less pain.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.", "health"),
        $_pocion3 = ($result_Phytoness[1]['Precio'] * 5) + ($result_Phytoness[4]['Precio'] * 2);
        //new Potion("Rats Repeller", [[0,3],[1,3],[2,3]],this,"Rats away.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","higiene"),
        $_pocion4 = ($result_Phytoness[0]['Precio'] * 3) + ($result_Phytoness[1]['Precio'] * 3) + ($result_Phytoness[2]['Precio'] * 3);
        //new Potion("Take Over Hangover", [[2, 2], [4, 3], [5, 3]],this,"Reduces hangover.","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","other"),
        $_pocion5 = ($result_Phytoness[2]['Precio'] * 2) + ($result_Phytoness[4]['Precio'] * 3) + ($result_Phytoness[5]['Precio'] * 3);
        //new Potion("Lovesickness", [[3,2],[4,3],[5,3]],this,"Anti heartbreak","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","social")
        $_pocion6 = ($result_Phytoness[3]['Precio'] * 2) + ($result_Phytoness[4]['Precio'] * 3) + ($result_Phytoness[5]['Precio'] * 3);

        $_poderes = array($_pocion1, $_pocion2, $_pocion3, $_pocion4, $_pocion5, $_pocion6);
        $_potions = "";
        
        for ($i=0; $i < count($result_data); $i++) {

            //echo $result_data[$i]['pociones'];
            //echo "<br>";
            
            $_posicion = 0;
            $_secuencia = "";
            $_PotArray = explode(",", $result_data[$i]['pociones']);
            
            for ($t=0; $t < count($_PotArray); $t++) {
                
                if ($_PotArray[$t] > 0)
                {
                    for ($p=0; $p < $_PotArray[$t]; $p++)
                    {
                        if ($_potions != "") { $_potions .= ", "; }
                        $_potions .= '('.$result_data[$i]['ID'].', '.($t + 1).', '.$_poderes[$t].', '.$_posicion.')';
                        $_posicion = $_posicion + 1;
    
                        if ($_secuencia != "") { $_secuencia .= ";"; }
                        $_secuencia .= ($t) . "," . $_poderes[$t];
                    }
                }
            }

            //echo 'UPDATE `PotionSeller_db` SET `PotionSeq` = "'.$_secuencia.'" WHERE ID = '. $result_data[$i]['ID'];
            //echo "<br>";

            $sth = $dbh->prepare('UPDATE `PotionSeller_db` SET `PotionSeq` = "'.$_secuencia.'" WHERE ID = '. $result_data[$i]['ID']);
            $sth->execute();

        }

        //echo 'INSERT INTO PocionesMagicPower (IDUsuario, TipoPocion, Power, Posicion) VALUES ' .$_potions;
        //echo "<br>";

        $sth = $dbh->prepare('INSERT INTO PocionesMagicPower (IDUsuario, TipoPocion, Power, Posicion) VALUES ' .$_potions);
        $sth->execute();
    }
    
    $dbh->commit();
}
catch(PDOException $e)
{
	echo "Error: " . $e->getMessage();
}
   
?>