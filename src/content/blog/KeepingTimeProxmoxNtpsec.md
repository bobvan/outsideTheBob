---
title: "Keeping Time with Proxmox and Ntpsec"
slug: "keeping-time-proxmox-ntpsec"
pubDate: 2025-11-17
description: "Considerations for Clock Sync Daemons and Proxmox"
draft: false
---

Tight time sync requires consistent latency between packet arrival and user space processing.
We can't expect consistent latency inside a container or VM.
And even if we could, we wouldn't want containers or VMs to be steering the Proxmox node clock shared by all.

My homelab has many hosts configured to expect DNS and NTP from two well-known IP addresses that were on
bare metal hosts that I have transitioned to Proxmox LXC containers with high availibility so that
they should both keep running in spite of sigle Proxmox node failure.

The constraints above lead me to running time sync daemons directly on my Proxmox nodes for consistent
latency between network and user space, but also running pass-through or "proxy" time sync daemons inside
the high-availability LXC containers bound to the well-known IP addresses.
These proxies deliver time sync services to other hosts in my homelab, but do not steer the
Proxmox node clock.

I've chosen `ntpsec` for  my sync daemon on the Proxmox cluster nodes.
The default `systemd-timesyncd.service` isn't really designed to
discipline the system clock to match master clocks.
Rather, it steps the system clock when the difference to a master clock is above a threshold, while making
occasional frequency adjustments below this threshold.
I considered `chrony` because it runs continuously, measures multiple masters against each other, chooses the best, and disciplines the system clock from it.
However, `chrony` is optimized for TSC discontinuities from CPU speed steps, sleep/wake, and CPU scheduling
lateny etc.
We should not see these in the Proxmox node itself.
Chrony would be great the best we could do if we couldn't run a time sync daemon
directly on the Proxmox node.

``` bash
apt install ntpsec
apt install ntpsec-ntpviz # Optional
```

Note that ntpviz now runs from a `systemd` timer, so there's no longer a need for a `crontab` entry.

URL for `ntpviz`: `http://ProxmoxHost/ntpviz/`
