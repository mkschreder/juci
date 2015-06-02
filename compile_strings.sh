#!/bin/bash

grunt nggettext_extract
rm po/all.pot ; msgcat po/*.pot > po/all.pot
grunt nggettext_compile
