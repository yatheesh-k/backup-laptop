
#!/bin/bash

sudo cp/ect/sys.conf /root/sys.conf.backup
sudo cat <<EOT>/etc/sysctl.conf
vm.max_map_count = 262144
 EOT

sudo apt update
sudo apt upgrade

sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'

sudo wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc &>/dev/null

sudo apt update
sudo apt-get -y install postgresql postgresql-contrib
sudo systemctl enable postgresql

sudo passwd postgres
su - postgres

sudo createuser sonar
 sudo psql
sudo ALTER USER sonar WITH ENCRYPTED password 'sonar';
sudo CREATE DATABASE sonarqube OWNER sonar;
sudo grant all privileges on DATABASE sonarqube to sonar;
sudo \q
exit

sudo bash

sudo apt install -y wget apt-transport-https
mkdir -p /etc/apt/keyrings

sudo wget -O - https://packages.adoptium.net/artifactory/api/gpg/key/public | tee /etc/apt/keyrings/adoptium.asc

sudo echo "deb [signed-by=/etc/apt/keyrings/adoptium.asc] https://packages.adoptium.net/artifactory/deb $(awk -F= '/^VERSION_CODENAME/{print$2}' /etc/os-release) main" | tee /etc/apt/sources.list.d/adoptium.list

apt update
sudo apt install temurin-17-jdk

update-alternatives --config java
/usr/bin/java --version
exi

sudo cat <<EOT>/etc/security/limits.conf

sonarqube   -   nofile   65536
sonarqube   -   nproc    4096
  EOT

sudo reboot


sudo wget https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-9.9.0.65466.zip
sudo apt install unzip

sudo unzip sonarqube-9.9.0.65466.zip -d /opt
sudo mv /opt/sonarqube-9.9.0.65466 /opt/sonarqube
sudo groupadd sonar
sudo useradd -c "user to run SonarQube" -d /opt/sonarqube -g sonar sonar

sudo chown sonar:sonar /opt/sonarqube -R
sudo cat <<EOT>/opt/sonarqube/conf/sonar.properties

sonar.jdbc.username=sonar
sonar.jdbc.password=sonar
sonar.jdbc.url=jdbc:postgresql://localhost:5432/sonarqube
  EOT

sudo cat <<EOT>/etc/systemd/system/sonar.service

[Unit]
Description=SonarQube service
After=syslog.target network.target

[Service]
Type=forking

ExecStart=/opt/sonarqube/bin/linux-x86-64/sonar.sh start
ExecStop=/opt/sonarqube/bin/linux-x86-64/sonar.sh stop

User=sonar
Group=sonar
Restart=always

LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
 EOT

sudo systemctl start sonar
sudo systemctl enable sonar
sudo systemctl status sonar
sudo tail -f /opt/sonarqube/logs/sonar.log


http://<IP>:9000


