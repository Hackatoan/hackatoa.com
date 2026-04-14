sed -i 's/permissions:/env:\n  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true\npermissions:/' .github/workflows/firebase-hosting-pull-request.yml
sed -i 's/permissions:/env:\n  FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true\npermissions:/' .github/workflows/firebase-hosting-merge.yml
