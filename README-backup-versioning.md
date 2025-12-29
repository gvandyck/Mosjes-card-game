# Mosjes Card Game – Versioning & Backup Workflow

## 1. Version Control (Git & GitHub)
- All source files are tracked in Git.
- Push changes to GitHub regularly for offsite versioning and collaboration.
- Tag releases for major milestones (e.g., v8.0, v8.1).
- Sensitive files and local artifacts are excluded via .gitignore.

## 2. Local Backups Before Deploy
- Every deployment creates a timestamped backup in the `backups/` folder.
- All deployed files and the Visuals directory are included in the backup.

## 3. FTP Offsite Backups
- Each deployment also uploads a copy of the backup to the FTP server (outside the web root) for extra redundancy.
- Backups are stored at: `/domains/eightytwenty.nl/backups/cardgame/<timestamp>/`

## 4. Restore Instructions
- To restore a backup, copy files from the desired `backups/<timestamp>/` folder back into the project or web root.
- For FTP, download the backup folder and copy files as needed.

## 5. Deployment
- Use `deploy_v3.ps1` to deploy and back up in one step.
- The script will:
  1. Create a local backup.
  2. Upload files to production.
  3. Upload the backup to FTP.

---

For questions or to restore a backup, contact the project maintainer.
