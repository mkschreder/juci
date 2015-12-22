The JUCI Story 
--------------

In April 2015 I came in as a consultant at Inteno in the middle of release
cycle for next generation of Iopsys Open Source SDK for Inteno broadband
routers. One of the things that fell on me is quickly adding new functionality
to the existing webgui. I quickly realized that it was not feasible. The
existing gui was written in lua and adding new pages was a bizarre journey of
knocking out html code by calling lua functions. It was bizarre at best and it
was not even Inteno's fault - they used a ready made solution and had on their
todo list for years the task of improving it. It just never came to completion.

So I took on me the task of creating the new gui. In two months I made a
working prototype to what was at the time called luci-express. It got that name
from the fact that originally I was exploring the idea of using nodejs and
express to build it - but then I instead settled for using angular.js and parts
of luci2 (with most of the code from luci2 now removed, but backend such as
rpcd was in fact created specifically for luci2 on openwrt and is still in use
today).

The name luci-express was however not descriptive enough - especially since the
"L" in luci stands for Lua and luci-express was basically writen in javascript.
So I came up with a better name for it instead which came to be the acronym for
Javascript Universal Configuration Interface - and that's how JUCI was born.
Besides, everyone seemed to like it so JUCI became the name.

It took another six months to make juci a worthy contestant for being used in a
production environment. Over time more people joined development and now we are
a few people adding new things to JUCI. It proved to be quite useful and
actually quite nice to work with. It was all made possible with initial support
from Inteno and Iopsys and the examples of already working systems. 

Contact: Martin K. Schröder <mkschreder.uk@gmail.com>
Git: https://github.com/mkschreder/juci.git 
