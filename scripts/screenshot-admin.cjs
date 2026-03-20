const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport: {width: 1440, height: 900}});
  
  try {
    console.log('Navigating to app...');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1000);
    
    console.log('Logging in as admin...');
    await page.click('button.bg-slate-300'); // Admin toggle
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'beidou@2026');
    await page.click('button:has-text("验证身份并进入后台")');
    await page.waitForTimeout(2000);
    
    console.log('Navigating to Directory tab...');
    await page.click('button:has-text("资源目录")');
    await page.waitForTimeout(1500);
    
    console.log('Opening Edit Modal...');
    // Click the first "编辑" button
    const editBtns = page.locator('button:has-text("编辑")');
    await editBtns.first().click();
    await page.waitForTimeout(2000); // Wait for modal animation
    
    console.log('Taking screenshot of Admin Edit Modal...');
    const editPath = path.join('C:\\Users\\tljtz\\.gemini\\antigravity\\brain\\355c51f8-e5bc-47c5-ba92-444d0a3f32a5', 'admin_edit_modal_new.png');
    await page.screenshot({ path: editPath, fullPage: true });

    // Close the edit modal
    await page.mouse.click(10, 10); // Click outside or...
    await page.locator('button:has-text("取消修改")').first().click();
    await page.waitForTimeout(1000);
    
    console.log('Navigating to Submissions tab...');
    await page.click('button:has-text("提报审核")');
    await page.waitForTimeout(1500);
    
    console.log('Expanding review modal...');
    const expandBtns = page.locator('button:has-text("展开全部信息")');
    await expandBtns.first().click();
    await page.waitForTimeout(1500);

    console.log('Taking screenshot of Admin Review Modal...');
    const reviewPath = path.join('C:\\Users\\tljtz\\.gemini\\antigravity\\brain\\355c51f8-e5bc-47c5-ba92-444d0a3f32a5', 'admin_review_modal_new.png');
    await page.screenshot({ path: reviewPath, fullPage: true });
    
    console.log('Done!');
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
