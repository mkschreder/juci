JUCI IPv4 ADDRESS INPUT
=======================

This control provides a nicer way for editing an ipv4 address. It shows 4 boxes that allow editing each group of digits and then automatically assembles these digits into a single string ip address when it writes it to the model. 

PARAMETERS
==========

* `ng-model` a model for the ip address (a string separated by dots)

USAGE
=====

	<juci-input-ipv4-address ng-model="connection.ipaddr.value"/>
