# openHAB
An openHAB client for Pebble, written using the Pebble.js framework.

## Maintainer
This repo needs a **new maintainer**.  With Pebble shutting down operations after its
sale to Fitbit, the current maintainer has moved on to other wearable technology for
home automation.  If you are interested in taking over maintenance of this repo, please
send email to pebble@openhab.org

## Configuration
After installing the application on your Pebble via the Pebble app on your phone,
go to the Configuration screen for the app on your phone to enter the necessary
information below.

### Local URL
This is the URL that you use to contact your openHAB server when within your home
network (i.e. behind your firewall).  Typically, this connection can be left
unsecured.  On first launch, this url is set to http://demo.openhab.org:8080.

### Remote URL
This is the URL that you use to contact your openHAB server when you are away from
your home, outside your firewall (i.e. from the Internet).  This connection should
be highly secured with SSL (e.g. https://)  and authentication.  If you don't plan
to access your server from the Internet, this field can be left blank.

### Username
If you have secured your server using authentication, enter your username here.
Otherwise, this field can be left blank.

### Password
The password for servers using authentication, otherwise blank.

### Sitemap
If you have more than one sitemap, you can set the default one with this field.
If you only have one sitemap, this field can be left blank, and your sitemap will
be auto selected by the Pebble app.  If your preconfigured sitemap cannot be found,
or if you have more than one sitemap and have not specified a default, the sitemap
list will be shown when you launch the app.  The sitemap list can also be show by
long pressing the SELECT button from an items page.

## Community: How to Get Involved

As any good open source project, the openHAB Pebble application welcomes community 
participation in the project. Read more in the [how to contribute](CONTRIBUTING.md) 
guide.

In case of problems or questions, please refer to the [openHAB Pebble application issue 
tracker](https://github.com/openhab/openhab.pebble/issues?page=1&state=open).

## Trademark Disclaimer

Product names, logos, brands and other trademarks referred to within the openHAB
Pebble application website are the property of their respective trademark holders. 
These trademark holders are not affiliated with the openHAB Pebble application or 
our website. They do not sponsor or endorse our materials.  In particular, the 
openHAB Pebble application is an independent software program and has not been 
authorized, sponsored, or otherwise approved by Pebble Technology Corp. 'Pebble' 
is a registered trademark of Pebble Technology Corp.

## History
This application was inspired by the PebbleHAB app written by Alex Bartis
(www.alexbartis.com)
