How to get your changes into the juci tree
==========================================

Benefits of doing this: 
- Your code gets integrated properly with the rest of juci 
- Your code will be updated as juci api:s change
- Your code will be made available directly from the official repo. 

Anyone who wishes to submit features and improvements is welcome to do so in
any format you wish. However, both the chances of your changes being included
will be greatly increased if you follow the guidelines specified below. 

If you have not already done this, clone official juci repo: 
git clone https://github.com/mkschreder/juci.git 

1) Develop your feature as a separate branch. 

You should be developing your new feature or fix as a separate local branch in
your git repository (a feature branch). Separate each part of your feature into
distinct commits based on logical changes - for example if you add a new
control and also fix a bug somewhere else as part of the same feature then make
these into two different commits. 

If your fix involves changing core juci files then always make sure that these
changes are in separate commit from changes you make to your own files.  

An easy way to stage speciffic files for commit is by using tig utility (sudo
apt-get install tig). You can then use Shift-S, u, and Shift-C shortcuts to
prepare your commits. When you have time you can learn more commands of tig. It
is a fully featured git browsing utility.

2) Rebase your work on latest master

git fetch --all
git checkout feature-you-developed
git rebase origin/master

3) Use git format-patch to prepare your patch file. 

git checkout feature-you-developed
git format-patch --stdout \
	origin/master > feature-you-developed.patch

(make the name of the patch file the same as your feature branch. It will make
it easy to identify which branch the patch contains). 

4) Submit your patch

Describe what you have done and what the purpose of your changes has been. If
you are making changes in order to add functionality which is very specific for
your build of juci then changes are that there is a more generic way of adding
your functionality. If you make it clear why you made changes then it becomes
easier to integrate your patch. So write down WHY you need to make the changes
you did.  

When done, send your patch file along with description to
mkschreder.uk[@]gmail.com


