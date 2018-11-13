const storage = require('node-persist');

const initializeStorage = async () => {
  // Init the storage from the relative path './.storage'
  await storage.init({
    dir: './.storage',
  });

  // Read the current stored values from the filesystem
  let lastTimestamp = await storage.getItem('lastTimestamp');
  let lastHash = await storage.getItem('lastHash');

  if (!lastTimestamp) {
    const counterInit = 0;
    
    // Store initial value into filesystem with key 'lastTimestamp'
    await storage.setItem('lastTimestamp', counterInit);
    lastTimestamp = await storage.getItem('lastTimestamp');
  }
    
  if (!lastHash) {
    const counterInit = "0x0";
    
    // Store initial value into filesystem with key 'lastHash'
    await storage.setItem('lastHash', counterInit);
    lastHash = await storage.getItem('lastHash');
  }
  return ({
    lastTimestamp
  });
}

module.exports = initializeStorage;