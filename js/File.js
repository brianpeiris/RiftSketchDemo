define([
],
function (
) {
  var File = function (name, contents) {
    this.name = name || 'Example';
    this.contents = contents;
    this.selected = false;
  };
  File.prototype.findNumberAt = function (index) {
    var matches = this.contents.substring(index).match(/-?\d+\.?\d*/)
    return matches && matches[0];
  };
  File.prototype.spinNumber = function (number, direction, amount) {
    if (number.indexOf('.') === -1) {
      return (parseInt(number, 10) + direction * amount).toString();
    }
    else {
      return (parseFloat(number) + direction * amount).toFixed(2);
    }
  };
  File.prototype.spinNumberAt = function (
    index, direction, amount, originalNumber
  ) {
    var number = this.findNumberAt(index);
    if (number === null) { return; }
    originalNumber = originalNumber || number;
    var newNumber = this.spinNumber(originalNumber, direction, amount);
    this.contents = (
      this.contents.substring(0, index) +
      newNumber +
      this.contents.substring(index + number.length)
    );
  };
  File.prototype.recordOriginalNumberAt = function (index) {
    var number = this.findNumberAt(index)
    if (number === null) { return; }
    this.originalIndex = index;
    this.originalNumber = number;
  };
  File.prototype.offsetOriginalNumber = function (offset) {
    this.spinNumberAt(this.originalIndex, 1, offset, this.originalNumber);
  };
  return File;
});

