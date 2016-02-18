#! /bin/sh
[ $# -lt 1 ] && echo 'URL needed'  && return;

IMGPATH="/tmp/firmware.bin"
rm -f $IMGPAT
while [ $# -gt 1 ]
	do
	key="$1"

	case $key in
		-u | --user)
			USER="$2"
			shift
			;;
		-p | --password)
			PASS="$2"
			shift
			;;
		-s | --save)
			SAVE=1;
			;;
		*)   # unknown option
		;;
	esac
	shift
done
URL=$1

[ "$USER" -a "$PASS" ] && wget -q --user="$USER" --password="$PASS" --spider $URL || wget -q --spider $URL

case $? in
	0)
		echo "Success";
		;;
	4)
		echo "Network error";
		return;
		;;
	6)
		echo "Authentication error";
		return;
		;;
	*)
		echo "Unknown error";
		return;
		;;
esac

[ "$USER" -a "$PASS" ] && wget -q --user="$USER" --password="$PASS" -O $IMGPATH $URL || wget -q -O $IMGPATH $URL

case $? in
	0)
		echo "Success";
		;;
	4)
		echo "Network error";
		return;
		;;
	6)
		echo "Authentication error";
		return;
		;;
	*)
		echo "Unknown error";
		return;
		;;
esac

sysupgrade -T $IMGPATH && sysupgrade $([ "$SAVE" ] || echo -n) $IMGPATH 

echo $?
