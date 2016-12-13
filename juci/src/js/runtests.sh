#!/bin/sh

istanbul cover _mocha -- -u exports -R tap
