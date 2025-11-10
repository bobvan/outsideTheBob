---
title: "First"
pubDate: 2025-11-10
description: "Trying out Astro"
draft: false
---

## Backup and Storage Design

### On-Site Backup Needs

* Fat finger recovery
* Local storage failure recovery
  * E.g. RAID0 with on drive failed or RAIDZ with two drives failed

#### Off-Site Backup Needs

* Local storage failure with local backup failure
* Site disaster recovery

### On-Site Storage Needs

#### Tier 1

* ZFS with ECC RAM
* Replicated HA boot
* Single-drive storage failure resilient

#### Tier 2

* ZFS with Non-ECC RAM
* Replicated HA boot
* Single-drive storage failure vulnerable

## Table Test



| Guest    | Node Boot | Storage | Example |
|----------|:-----|---------:|:-----:|
| Tier 1 | RAID1 ZFS w/ECC RAM, Backed up, Replicated, HA | Automated node failover in seconds | Critical network services |
| Tier 2 | RAID1 ZFS w/Non-ECC RAM, Backed up      | Manual node failure recovery | DVR, chain, fah |
| Tier 3 | RAID1 ZFS                 | Row 3 Col 3 | XXX |

* Node boots to run guest
* Guest boots to serve clients
* Some guests may access non-boot bulk storage, typically > double-digit GB
* Nodes dump to backup servers
* Baseline: RAID1 ZFS Non-ECC boot for nodes and backup servers

* XXX Boot failure resilience: 
* XXX Storage failure resilience: 
