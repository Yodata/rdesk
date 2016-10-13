test: tests
tests: install_modules
	@echo ""
	@echo "--- Executing tests ---"
	./node_modules/.bin/mocha $(T) --async-only test/*.test.js

install_modules:
	@echo ""
	@echo "--- Installing modules ---"
	npm install --development

.PHONY: test