sudo apt update -y
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt/ `lsb_release -cs`-pgdg main" /etc/apt/sources.list.d/pgdg.list'
sudo wget -q https://www.postgresql.org/media/keys/ACCC4CF8.asc -O - | sudo apt-key add -
sudo apt install postgresql postgresql-contrib -y
sudo systemctl enable postgresql
sudo systemctl start postgresql
sudo systemctl status postgresql

#setting postgresql password
sudo echo "postgres:sonar" | sudo chpasswd

sudo runuser -l postgres -c "createuser sonar"


#sudo -i -u postgres
#createuser sonar
#psql
sudo -i -u postgres psql -c "ALTER USER sonar WITH ENCRYPTED password 'sonar';"
sudo -i -u postgres psql -c "CREATE DATABASE sonardb OWNER sonar;"
sudo -i -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE sonardb to sonar;"
#\q
#Exit
sudo echo "postgresql installation completed"
